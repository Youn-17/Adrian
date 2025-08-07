-- 创建教育领域Meta分析系统数据库表结构

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'researcher' CHECK (role IN ('admin', 'senior_researcher', 'researcher')),
    institution VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建项目表
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    research_question TEXT NOT NULL,
    inclusion_criteria TEXT,
    exclusion_criteria TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建论文表
CREATE TABLE IF NOT EXISTS papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    authors TEXT,
    journal VARCHAR(255),
    year INTEGER,
    doi VARCHAR(255),
    abstract TEXT,
    keywords TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'included', 'excluded')),
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 10),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    semantic_scholar_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建数据集表
CREATE TABLE IF NOT EXISTS datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    row_count INTEGER DEFAULT 0,
    column_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processed', 'error')),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建数据集数据表（存储实际的数据行）
CREATE TABLE IF NOT EXISTS dataset_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    row_index INTEGER NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建分析表
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('fixed_effect', 'random_effect')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 创建分析结果表
CREATE TABLE IF NOT EXISTS results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    effect_size DECIMAL(10, 6),
    confidence_interval_lower DECIMAL(10, 6),
    confidence_interval_upper DECIMAL(10, 6),
    p_value DECIMAL(10, 8),
    heterogeneity_i2 DECIMAL(5, 2),
    heterogeneity_q DECIMAL(10, 6),
    heterogeneity_p DECIMAL(10, 8),
    tau_squared DECIMAL(10, 6),
    studies_count INTEGER,
    total_sample_size INTEGER,
    forest_plot_data JSONB,
    funnel_plot_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建论文分类历史表
CREATE TABLE IF NOT EXISTS paper_classifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('included', 'excluded')),
    reason TEXT,
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 10),
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_papers_project_id ON papers(project_id);
CREATE INDEX IF NOT EXISTS idx_papers_status ON papers(status);
CREATE INDEX IF NOT EXISTS idx_papers_year ON papers(year);
CREATE INDEX IF NOT EXISTS idx_datasets_project_id ON datasets(project_id);
CREATE INDEX IF NOT EXISTS idx_dataset_data_dataset_id ON dataset_data(dataset_id);
CREATE INDEX IF NOT EXISTS idx_analyses_project_id ON analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);
CREATE INDEX IF NOT EXISTS idx_results_analysis_id ON results(analysis_id);
CREATE INDEX IF NOT EXISTS idx_paper_classifications_paper_id ON paper_classifications(paper_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_papers_updated_at BEFORE UPDATE ON papers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON datasets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_classifications ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略

-- 用户表策略：用户只能查看和更新自己的信息
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 项目表策略：用户只能访问自己的项目
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- 论文表策略：通过项目关联控制访问
CREATE POLICY "Users can view papers in own projects" ON papers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = papers.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert papers in own projects" ON papers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = papers.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update papers in own projects" ON papers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = papers.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete papers in own projects" ON papers
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = papers.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- 数据集表策略：通过项目关联控制访问
CREATE POLICY "Users can view datasets in own projects" ON datasets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = datasets.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert datasets in own projects" ON datasets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = datasets.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update datasets in own projects" ON datasets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = datasets.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete datasets in own projects" ON datasets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = datasets.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- 数据集数据表策略：通过数据集关联控制访问
CREATE POLICY "Users can view dataset data in own projects" ON dataset_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM datasets 
            JOIN projects ON projects.id = datasets.project_id
            WHERE datasets.id = dataset_data.dataset_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert dataset data in own projects" ON dataset_data
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM datasets 
            JOIN projects ON projects.id = datasets.project_id
            WHERE datasets.id = dataset_data.dataset_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update dataset data in own projects" ON dataset_data
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM datasets 
            JOIN projects ON projects.id = datasets.project_id
            WHERE datasets.id = dataset_data.dataset_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete dataset data in own projects" ON dataset_data
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM datasets 
            JOIN projects ON projects.id = datasets.project_id
            WHERE datasets.id = dataset_data.dataset_id 
            AND projects.user_id = auth.uid()
        )
    );

-- 分析表策略：通过项目关联控制访问
CREATE POLICY "Users can view analyses in own projects" ON analyses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = analyses.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert analyses in own projects" ON analyses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = analyses.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update analyses in own projects" ON analyses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = analyses.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete analyses in own projects" ON analyses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = analyses.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- 结果表策略：通过分析关联控制访问
CREATE POLICY "Users can view results in own projects" ON results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM analyses 
            JOIN projects ON projects.id = analyses.project_id
            WHERE analyses.id = results.analysis_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert results in own projects" ON results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM analyses 
            JOIN projects ON projects.id = analyses.project_id
            WHERE analyses.id = results.analysis_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update results in own projects" ON results
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM analyses 
            JOIN projects ON projects.id = analyses.project_id
            WHERE analyses.id = results.analysis_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete results in own projects" ON results
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM analyses 
            JOIN projects ON projects.id = analyses.project_id
            WHERE analyses.id = results.analysis_id 
            AND projects.user_id = auth.uid()
        )
    );

-- 论文分类历史表策略：通过论文关联控制访问
CREATE POLICY "Users can view paper classifications in own projects" ON paper_classifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM papers 
            JOIN projects ON projects.id = papers.project_id
            WHERE papers.id = paper_classifications.paper_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert paper classifications in own projects" ON paper_classifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM papers 
            JOIN projects ON projects.id = papers.project_id
            WHERE papers.id = paper_classifications.paper_id 
            AND projects.user_id = auth.uid()
        )
    );

-- 授予必要的权限给anon和authenticated角色
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 为anon角色授予基本权限（用于注册等公开操作）
GRANT SELECT, INSERT ON users TO anon;

-- 创建一些有用的视图

-- 项目统计视图
CREATE OR REPLACE VIEW project_stats AS
SELECT 
    p.id,
    p.title,
    p.status,
    p.created_at,
    COUNT(DISTINCT papers.id) as papers_count,
    COUNT(DISTINCT CASE WHEN papers.status = 'included' THEN papers.id END) as included_papers_count,
    COUNT(DISTINCT datasets.id) as datasets_count,
    COUNT(DISTINCT analyses.id) as analyses_count,
    COUNT(DISTINCT CASE WHEN analyses.status = 'completed' THEN analyses.id END) as completed_analyses_count
FROM projects p
LEFT JOIN papers ON papers.project_id = p.id
LEFT JOIN datasets ON datasets.project_id = p.id
LEFT JOIN analyses ON analyses.project_id = p.id
GROUP BY p.id, p.title, p.status, p.created_at;

-- 为视图设置所有者
ALTER VIEW project_stats OWNER TO postgres;

-- 注意：视图不支持RLS策略，访问控制通过底层表的RLS策略实现

-- 插入一些示例数据（可选，用于测试）
-- 注意：在生产环境中应该删除这些示例数据

-- 创建示例管理员用户（密码: admin123）
INSERT INTO users (id, email, password_hash, name, role, institution) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'admin@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '系统管理员', 'admin', '示例大学')
ON CONFLICT (email) DO NOTHING;

-- 创建示例研究员用户（密码: researcher123）
INSERT INTO users (id, email, password_hash, name, role, institution) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'researcher@example.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '研究员', 'researcher', '示例大学')
ON CONFLICT (email) DO NOTHING;

-- 创建示例项目
INSERT INTO projects (id, title, description, research_question, inclusion_criteria, exclusion_criteria, status, user_id) VALUES 
('660e8400-e29b-41d4-a716-446655440000', '教育技术对学习效果的影响研究', '本研究旨在通过Meta分析方法，系统评估教育技术在提高学生学习效果方面的作用。', '教育技术的使用是否能够显著提高学生的学习效果？', '1. 随机对照试验\n2. 发表于2010年以后\n3. 包含学习效果测量指标\n4. 英文或中文发表', '1. 非随机研究\n2. 样本量小于30\n3. 缺乏对照组\n4. 数据不完整', 'active', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- 提交事务
COMMIT;