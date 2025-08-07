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
  summary?: string;
  clinicalSignificance?: string;
  evidenceQuality?: string;
  publicationBiasInterpretation?: string;
  subgroupAnalysisInterpretation?: string;
  sensitivityAnalysisInterpretation?: string;
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

  // 发表偏倚结果解读
  async interpretPublicationBias(biasResults: any): Promise<string> {
    const prompt = `
请解读以下发表偏倚检验结果：

Egger回归检验：
- 截距：${biasResults.eggerTest?.intercept || 'N/A'}
- P值：${biasResults.eggerTest?.pValue || 'N/A'}
- 是否显著：${biasResults.eggerTest?.significant ? '是' : '否'}

Begg秩相关检验：
- Tau值：${biasResults.beggTest?.tau || 'N/A'}
- P值：${biasResults.beggTest?.pValue || 'N/A'}
- 是否显著：${biasResults.beggTest?.significant ? '是' : '否'}

漏斗图：${biasResults.funnelPlot || 'N/A'}

请提供：
1. 发表偏倚的存在性评估
2. 对结果可靠性的影响
3. 改进建议
4. 临床解读意义

请用专业语言解读。
`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: '你是一位元分析专家，专门从事发表偏倚评估和解读。请用中文提供专业分析。'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {
      const response = await aiService.chatCompletion(messages);
      return response.choices[0]?.message?.content || '发表偏倚解读失败';
    } catch (error) {
      console.error('发表偏倚解读错误:', error);
      return '发表偏倚解读服务暂时不可用，请稍后重试。';
    }
  }

  // 亚组分析结果解读
  async interpretSubgroupAnalysis(subgroupResults: any): Promise<string> {
    const subgroupsInfo = subgroupResults.subgroups?.map((sg: any) => 
      `- ${sg.name}: 效应量=${sg.pooledEffect?.toFixed(3)}, 95%CI=[${sg.confidenceInterval?.[0]?.toFixed(3)}, ${sg.confidenceInterval?.[1]?.toFixed(3)}], P=${sg.pValue?.toFixed(3)}`
    ).join('\n') || '';

    const prompt = `
请解读以下亚组分析结果：

亚组结果：
${subgroupsInfo}

组间异质性检验：
- Q统计量：${subgroupResults.betweenGroupsTest?.Q || 'N/A'}
- 自由度：${subgroupResults.betweenGroupsTest?.df || 'N/A'}
- P值：${subgroupResults.betweenGroupsTest?.pValue || 'N/A'}

请提供：
1. 各亚组效应的比较分析
2. 组间差异的统计学意义
3. 临床意义解读
4. 异质性来源分析
5. 结果的可靠性评估

请用专业语言解读。
`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: '你是一位元分析专家，专门从事亚组分析和异质性评估。请用中文提供专业分析。'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {
      const response = await aiService.chatCompletion(messages);
      return response.choices[0]?.message?.content || '亚组分析解读失败';
    } catch (error) {
      console.error('亚组分析解读错误:', error);
      return '亚组分析解读服务暂时不可用，请稍后重试。';
    }
  }

  // 敏感性分析结果解读
  async interpretSensitivityAnalysis(sensitivityResults: any[]): Promise<string> {
    const resultsInfo = sensitivityResults?.map((result: any, index: number) => 
      `- 排除研究${result.excludedStudy || index + 1}: 效应量=${result.pooledEffect?.toFixed(3)}, 95%CI=[${result.confidenceInterval?.[0]?.toFixed(3)}, ${result.confidenceInterval?.[1]?.toFixed(3)}]`
    ).join('\n') || '';

    const prompt = `
请解读以下敏感性分析结果：

逐一排除研究后的效应量变化：
${resultsInfo}

请提供：
1. 结果稳定性评估
2. 关键研究识别
3. 对总体结论的影响
4. 结果可靠性评价
5. 临床解读建议

请用专业语言解读。
`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: '你是一位元分析专家，专门从事敏感性分析和结果稳定性评估。请用中文提供专业分析。'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {
      const response = await aiService.chatCompletion(messages);
      return response.choices[0]?.message?.content || '敏感性分析解读失败';
    } catch (error) {
      console.error('敏感性分析解读错误:', error);
      return '敏感性分析解读服务暂时不可用，请稍后重试。';
    }
  }

  // 综合结果解读（包含所有分析结果）
  async interpretComprehensiveResults(analysisResults: any): Promise<AnalysisResult> {
    const prompt = `
请对以下完整的元分析结果进行综合解读：

主要结果：
- 总体效应量：${analysisResults.overallEffect?.estimate}
- 95%置信区间：[${analysisResults.overallEffect?.confidenceInterval?.[0]}, ${analysisResults.overallEffect?.confidenceInterval?.[1]}]
- P值：${analysisResults.overallEffect?.pValue}
- 异质性I²：${analysisResults.heterogeneity?.iSquared}%
- 纳入研究：${analysisResults.studyCount}项
- 总参与者：${analysisResults.totalParticipants}人

发表偏倚检验：
- Egger检验P值：${analysisResults.publicationBias?.eggerTest?.pValue}
- Begg检验P值：${analysisResults.publicationBias?.beggTest?.pValue}

请按以下格式提供解读：

【结果摘要】
简要总结主要发现

【临床意义】
解读结果的临床/实践意义

【证据质量】
评估证据的可靠性和质量等级

【主要局限性】
列出研究的主要限制

【未来研究建议】
提出改进和深入研究的方向

【学术摘要】
适合发表的简洁摘要

请用专业但易懂的语言。
`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: '你是一位资深的循证医学专家和学术写作专家，擅长综合解读元分析结果。请用中文提供详细分析。'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {
      const response = await aiService.chatCompletion(messages);
      const content = response.choices[0]?.message?.content || '';
      
      return this.parseComprehensiveInterpretation(content);
    } catch (error) {
      console.error('综合结果解读错误:', error);
      return {
        interpretation: '综合结果解读服务暂时不可用，请稍后重试。',
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

  // 解析综合解读结果
  private parseComprehensiveInterpretation(content: string): AnalysisResult {
    return {
      interpretation: content,
      summary: this.extractSection(content, ['结果摘要', '摘要']),
      clinicalSignificance: this.extractSection(content, ['临床意义', '实践意义']),
      evidenceQuality: this.extractSection(content, ['证据质量', '质量等级']),
      recommendations: this.extractListItems(content, ['建议', '推荐']),
      limitations: this.extractListItems(content, ['局限性', '限制', '局限']),
      futureDirections: this.extractListItems(content, ['未来研究', '进一步研究', '未来']),
      academicSummary: this.extractSection(content, ['学术摘要', '摘要'])
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