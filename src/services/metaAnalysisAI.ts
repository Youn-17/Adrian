import { aiService, ChatMessage } from './aiService';

interface MetaAnalysisData {
  studies: Array<{
    id: string;
    title: string;
    author: string;
    year: number;
    sampleSize: number;
    effectSize: number;
    standardError: number;
  }>;
  overallEffect: number;
  confidenceInterval: [number, number];
  heterogeneity: {
    qStatistic: number;
    iSquared: number;
    pValue: number;
  };
}

interface AnalysisResult {
  interpretation: string;
  recommendations: string[];
  limitations: string[];
  futureDirections: string[];
  academicSummary: string;
}

class MetaAnalysisAI {
  // 数据质量评估
  async assessDataQuality(data: MetaAnalysisData): Promise<string> {
    const prompt = `
作为元分析专家，请评估以下数据的质量：

研究数量：${data.studies.length}
总体效应量：${data.overallEffect}
置信区间：[${data.confidenceInterval[0]}, ${data.confidenceInterval[1]}]
异质性指标：
- Q统计量：${data.heterogeneity.qStatistic}
- I²：${data.heterogeneity.iSquared}%
- p值：${data.heterogeneity.pValue}

样本量分布：
${data.studies.map(s => `- ${s.title}: n=${s.sampleSize}`).join('\n')}

请从以下角度评估数据质量：
1. 样本量充足性
2. 研究数量是否足够
3. 异质性水平评估
4. 潜在的偏倚风险
5. 数据完整性

请提供具体的改进建议。
`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: '你是一位专业的元分析专家，擅长评估研究数据质量和提供改进建议。请用中文回答。'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {
      const response = await aiService.chatCompletion(messages);
      return response.choices[0]?.message?.content || '数据质量评估失败';
    } catch (error) {
      console.error('数据质量评估错误:', error);
      return '数据质量评估服务暂时不可用，请稍后重试。';
    }
  }

  // 统计方法推荐
  async recommendStatisticalMethods(data: MetaAnalysisData): Promise<string> {
    const prompt = `
基于以下元分析数据特征，请推荐最适合的统计方法：

研究特征：
- 研究数量：${data.studies.length}
- 异质性I²：${data.heterogeneity.iSquared}%
- 效应量范围：${Math.min(...data.studies.map(s => s.effectSize))} 到 ${Math.max(...data.studies.map(s => s.effectSize))}
- 样本量变异：${Math.min(...data.studies.map(s => s.sampleSize))} 到 ${Math.max(...data.studies.map(s => s.sampleSize))}

请推荐：
1. 最适合的效应量模型（固定效应 vs 随机效应）
2. 异质性检验方法
3. 敏感性分析策略
4. 发表偏倚检测方法
5. 亚组分析建议

请解释推荐理由。
`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: '你是一位资深的生物统计学专家，专门从事元分析方法学研究。请用中文提供专业建议。'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {
      const response = await aiService.chatCompletion(messages);
      return response.choices[0]?.message?.content || '统计方法推荐失败';
    } catch (error) {
      console.error('统计方法推荐错误:', error);
      return '统计方法推荐服务暂时不可用，请稍后重试。';
    }
  }

  // 结果解读
  async interpretResults(data: MetaAnalysisData): Promise<AnalysisResult> {
    const prompt = `
请对以下元分析结果进行专业解读：

主要结果：
- 总体效应量：${data.overallEffect}
- 95%置信区间：[${data.confidenceInterval[0]}, ${data.confidenceInterval[1]}]
- 异质性I²：${data.heterogeneity.iSquared}%
- Q统计量：${data.heterogeneity.qStatistic} (p=${data.heterogeneity.pValue})
- 纳入研究：${data.studies.length}项
- 总样本量：${data.studies.reduce((sum, s) => sum + s.sampleSize, 0)}

请提供：
1. 结果的临床/实践意义解读
2. 统计学意义评估
3. 证据质量等级
4. 主要局限性
5. 对未来研究的建议
6. 学术摘要（适合发表）

请用专业但易懂的语言回答。
`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: '你是一位经验丰富的循证医学专家，擅长解读元分析结果并撰写学术报告。请用中文提供详细分析。'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {
      const response = await aiService.chatCompletion(messages);
      const content = response.choices[0]?.message?.content || '';
      
      // 解析AI回复，提取不同部分
      return this.parseInterpretationResponse(content);
    } catch (error) {
      console.error('结果解读错误:', error);
      return {
        interpretation: '结果解读服务暂时不可用，请稍后重试。',
        recommendations: [],
        limitations: [],
        futureDirections: [],
        academicSummary: ''
      };
    }
  }

  // 生成学术报告
  async generateAcademicReport(data: MetaAnalysisData, title: string): Promise<string> {
    const prompt = `
请为以下元分析研究生成一份完整的学术报告：

研究标题：${title}

数据摘要：
- 纳入研究：${data.studies.length}项
- 总样本量：${data.studies.reduce((sum, s) => sum + s.sampleSize, 0)}
- 总体效应量：${data.overallEffect}
- 95%置信区间：[${data.confidenceInterval[0]}, ${data.confidenceInterval[1]}]
- 异质性I²：${data.heterogeneity.iSquared}%

请按以下结构生成报告：
1. 摘要（目的、方法、结果、结论）
2. 引言（研究背景和目的）
3. 方法（检索策略、纳入排除标准、统计分析）
4. 结果（研究特征、主要结果、异质性分析）
5. 讨论（结果解读、局限性、临床意义）
6. 结论
7. 参考文献格式建议

请使用学术写作风格，符合国际期刊发表标准。
`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: '你是一位资深的医学研究者和学术写作专家，擅长撰写高质量的元分析论文。请用中文撰写。'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {
      const response = await aiService.chatCompletion(messages);
      return response.choices[0]?.message?.content || '学术报告生成失败';
    } catch (error) {
      console.error('学术报告生成错误:', error);
      return '学术报告生成服务暂时不可用，请稍后重试。';
    }
  }

  // 解析AI回复内容
  private parseInterpretationResponse(content: string): AnalysisResult {
    const sections = content.split(/\n\s*\n/);
    
    return {
      interpretation: content,
      recommendations: this.extractListItems(content, ['建议', '推荐']),
      limitations: this.extractListItems(content, ['局限', '限制']),
      futureDirections: this.extractListItems(content, ['未来', '进一步']),
      academicSummary: this.extractSection(content, ['摘要', '总结'])
    };
  }

  private extractListItems(content: string, keywords: string[]): string[] {
    const items: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (keywords.some(keyword => line.includes(keyword)) && 
          (line.includes('•') || line.includes('-') || line.includes('1.') || line.includes('2.'))) {
        items.push(line.trim());
      }
    }
    
    return items;
  }

  private extractSection(content: string, keywords: string[]): string {
    const lines = content.split('\n');
    let inSection = false;
    let section = '';
    
    for (const line of lines) {
      if (keywords.some(keyword => line.includes(keyword))) {
        inSection = true;
        continue;
      }
      
      if (inSection) {
        if (line.trim() === '') {
          break;
        }
        section += line + '\n';
      }
    }
    
    return section.trim();
  }
}

export const metaAnalysisAI = new MetaAnalysisAI();
export type { MetaAnalysisData, AnalysisResult };