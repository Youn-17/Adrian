import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  ArrowLeft,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Database,
  Palette,
  Globe,
  Shield,
  Bell,
  HardDrive,
  Info
} from 'lucide-react';
import { useUserSettings, useDataManagement } from '../hooks/useLocalStorage';
import { UserSettings } from '../types';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useUserSettings();
  const { exportData, importData, clearAllData, getStorageInfo } = useDataManagement();
  const [localSettings, setLocalSettings] = useState<UserSettings | null>(settings);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    const info = getStorageInfo();
    setStorageInfo(info);
  }, [getStorageInfo]);

  const handleSave = async () => {
    try {
      if (localSettings) {
        await updateSettings(localSettings);
        toast.success('设置已保存');
      }
    } catch (error) {
      toast.error('保存失败');
    }
  };

  const handleReset = async () => {
    if (window.confirm('确定要重置所有设置吗？此操作不可恢复。')) {
      try {
        await resetSettings();
        const info = getStorageInfo();
        setStorageInfo(info);
        toast.success('设置已重置');
      } catch (error) {
        toast.error('重置失败');
      }
    }
  };

  const handleExportData = async () => {
    try {
      await exportData();
      toast.success('数据已导出');
    } catch (error) {
      toast.error('导出失败');
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importData(file);
      toast.success('数据已导入');
      // 刷新存储信息
      const info = getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      toast.error('导入失败');
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可恢复，包括项目、数据集和分析结果。')) {
      try {
        await clearAllData();
        toast.success('所有数据已清除');
        // 刷新存储信息
        const info = getStorageInfo();
        setStorageInfo(info);
      } catch (error) {
        toast.error('清除失败');
      }
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const tabs = [
    { id: 'general', name: '常规设置', icon: SettingsIcon },
    { id: 'appearance', name: '外观', icon: Palette },
    { id: 'data', name: '数据管理', icon: Database },
    { id: 'privacy', name: '隐私安全', icon: Shield },
    { id: 'about', name: '关于', icon: Info }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="h-5 w-5 mr-2" />
                返回仪表板
              </Link>
              <SettingsIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">系统设置</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                保存设置
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 侧边栏 */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* 主内容区 */}
          <div className="flex-1">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">常规设置</h2>
                  
                  <div className="space-y-6">
                    {/* 语言设置 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe className="h-4 w-4 inline mr-2" />
                        界面语言
                      </label>
                      <select
                        value={localSettings.general?.language || 'zh'}
                        onChange={(e) => setLocalSettings({...localSettings, general: {...localSettings.general, language: e.target.value as 'zh' | 'en'}})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="zh-CN">简体中文</option>
                        <option value="en-US">English</option>
                      </select>
                    </div>

                    {/* 通知设置 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Bell className="h-4 w-4 inline mr-2" />
                        通知设置
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={localSettings.general?.notifications || false}
                            onChange={(e) => setLocalSettings({
                              ...localSettings,
                              general: {
                                ...localSettings.general,
                                notifications: e.target.checked
                              }
                            })}
                            className="mr-3"
                          />
                          分析完成通知
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={localSettings.general?.autoSave || false}
                            onChange={(e) => setLocalSettings({
                              ...localSettings,
                              general: {
                                ...localSettings.general,
                                autoSave: e.target.checked
                              }
                            })}
                            className="mr-3"
                          />
                          数据上传通知
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={localSettings.general?.notifications || false}
                            onChange={(e) => setLocalSettings({
                              ...localSettings,
                              general: {
                                ...localSettings.general,
                                notifications: e.target.checked
                              }
                            })}
                            className="mr-3"
                          />
                          系统更新通知
                        </label>
                      </div>
                    </div>

                    {/* 自动保存 */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={localSettings.general?.autoSave || false}
                          onChange={(e) => setLocalSettings({...localSettings, general: {...localSettings.general, autoSave: e.target.checked}})}
                          className="mr-3"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          启用自动保存
                        </span>
                      </label>
                      <p className="text-sm text-gray-500 mt-1 ml-6">
                        自动保存项目和分析进度
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">外观设置</h2>
                  
                  <div className="space-y-6">
                    {/* 主题设置 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        主题模式
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['light', 'dark', 'auto'].map((theme) => (
                          <button
                            key={theme}
                            onClick={() => setLocalSettings({...localSettings, appearance: {...localSettings.appearance, theme: theme as 'light' | 'dark' | 'auto'}})}
                            className={`p-3 border rounded-lg text-center transition-colors ${
                              localSettings.appearance?.theme === theme
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {theme === 'light' && '浅色'}
                            {theme === 'dark' && '深色'}
                            {theme === 'auto' && '自动'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 字体大小 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        字体大小
                      </label>
                      <select
                        value={localSettings.appearance?.fontSize || 'medium'}
                        onChange={(e) => setLocalSettings({...localSettings, appearance: {...localSettings.appearance, fontSize: e.target.value as 'small' | 'medium' | 'large'}})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="small">小</option>
                        <option value="medium">中</option>
                        <option value="large">大</option>
                      </select>
                    </div>

                    {/* 紧凑模式 */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={localSettings.appearance?.compactMode || false}
                          onChange={(e) => setLocalSettings({...localSettings, appearance: {...localSettings.appearance, compactMode: e.target.checked}})}
                          className="mr-3"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          紧凑模式
                        </span>
                      </label>
                      <p className="text-sm text-gray-500 mt-1 ml-6">
                        减少界面元素间距，显示更多内容
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">数据管理</h2>
                  
                  {/* 存储信息 */}
                  {storageInfo && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                        <HardDrive className="h-5 w-5 mr-2" />
                        存储使用情况
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">项目数量</p>
                          <p className="font-medium">{storageInfo.projects}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">数据集数量</p>
                          <p className="font-medium">{storageInfo.datasets}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">分析数量</p>
                          <p className="font-medium">{storageInfo.analyses}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">存储大小</p>
                          <p className="font-medium">{formatBytes(storageInfo.totalSize)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {/* 导出数据 */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">导出所有数据</h3>
                        <p className="text-sm text-gray-600">将所有项目、数据集和分析结果导出为JSON文件</p>
                      </div>
                      <button
                        onClick={handleExportData}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        导出
                      </button>
                    </div>

                    {/* 导入数据 */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">导入数据</h3>
                        <p className="text-sm text-gray-600">从JSON文件导入数据（会覆盖现有数据）</p>
                      </div>
                      <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        导入
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportData}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* 清除所有数据 */}
                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div>
                        <h3 className="font-medium text-red-900">清除所有数据</h3>
                        <p className="text-sm text-red-700">永久删除所有项目、数据集和分析结果</p>
                      </div>
                      <button
                        onClick={handleClearAllData}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        清除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">隐私与安全</h2>
                  
                  <div className="space-y-6">
                    {/* 数据隐私 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        数据隐私保护
                      </h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• 所有数据仅存储在您的本地浏览器中</li>
                        <li>• 我们不会收集或上传您的研究数据</li>
                        <li>• DeepSeek API仅用于分析建议，不存储您的数据</li>
                        <li>• 您可以随时导出或删除所有数据</li>
                      </ul>
                    </div>

                    {/* API设置 */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">API设置</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={localSettings.privacy?.shareUsageStats || false}
                            onChange={(e) => setLocalSettings({
                              ...localSettings,
                              privacy: {
                                ...localSettings.privacy,
                                shareUsageStats: e.target.checked
                              }
                            })}
                            className="mr-3"
                          />
                          启用使用分析（匿名）
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={localSettings.apiSettings?.cacheResults || true}
                            onChange={(e) => setLocalSettings({
                              ...localSettings,
                              apiSettings: {
                                ...localSettings.apiSettings,
                                cacheResults: e.target.checked
                              }
                            })}
                            className="mr-3"
                          />
                          缓存API结果
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">关于系统</h2>
                  
                  <div className="space-y-6">
                    {/* 系统信息 */}
                    <div className="text-center">
                      <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <SettingsIcon className="h-10 w-10 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">静态元分析系统</h3>
                      <p className="text-gray-600 mb-4">版本 1.0.0</p>
                      <p className="text-sm text-gray-500 max-w-md mx-auto">
                        基于AI的静态元分析工具，支持Web of Science数据处理、
                        统计分析和结果可视化，为研究人员提供专业的元分析解决方案。
                      </p>
                    </div>

                    {/* 技术栈 */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">技术栈</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="font-medium">React 18</p>
                          <p className="text-gray-600">前端框架</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="font-medium">TypeScript</p>
                          <p className="text-gray-600">类型安全</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="font-medium">Tailwind CSS</p>
                          <p className="text-gray-600">样式框架</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="font-medium">Vite</p>
                          <p className="text-gray-600">构建工具</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="font-medium">DeepSeek API</p>
                          <p className="text-gray-600">AI分析</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="font-medium">GitHub Pages</p>
                          <p className="text-gray-600">部署平台</p>
                        </div>
                      </div>
                    </div>

                    {/* 联系信息 */}
                    <div className="border-t pt-6">
                      <h3 className="font-medium text-gray-900 mb-3">支持与反馈</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>如果您在使用过程中遇到问题或有改进建议，欢迎联系我们：</p>
                        <p>• GitHub: <a href="#" className="text-blue-600 hover:underline">项目仓库</a></p>
                        <p>• 邮箱: support@meta-analysis.com</p>
                        <p>• 文档: <a href="#" className="text-blue-600 hover:underline">使用指南</a></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 重置按钮 */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleReset}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                重置所有设置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;