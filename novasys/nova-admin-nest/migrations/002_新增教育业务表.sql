-- =====================================================
-- 教育管理系统数据库迁移脚本
-- 阶段一：新增教育业务表
-- 日期：2026-04-01
-- =====================================================

-- ----------------------------
-- 1. 教师表 jy_jiaoshi
-- ----------------------------
CREATE TABLE IF NOT EXISTS jy_jiaoshi (
  id SERIAL PRIMARY KEY,
  yonghu_id INT,                              -- 关联系统用户ID
  gonghao VARCHAR(30) UNIQUE,                 -- 工号
  xingming VARCHAR(50) NOT NULL,              -- 姓名
  xingbie VARCHAR(10),                        -- 性别
  shenfenzheng VARCHAR(18),                  -- 身份证号
  shoujihao VARCHAR(11),                     -- 手机号
  youxiang VARCHAR(100),                      -- 邮箱
  jiaoshileixing VARCHAR(20),                -- 教师类型（正式/临聘/实习）
  ruzhi_riqi DATE,                            -- 入职日期
  zhuanye VARCHAR(50),                        -- 所教专业
  zhicheng VARCHAR(50),                       -- 职称
  jianli TEXT,                                -- 个人简历
  beizhu VARCHAR(500),                        -- 备注
  zhuangtai INT DEFAULT 0,                    -- 状态（0在职 1离职 2退休）
  chuangjian_shijian TIMESTAMP DEFAULT NOW(),
  gengxin_shijian TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE jy_jiaoshi IS '教师信息表';
COMMENT ON COLUMN jy_jiaoshi.yonghu_id IS '关联系统用户ID';
COMMENT ON COLUMN jy_jiaoshi.gonghao IS '工号';
COMMENT ON COLUMN jy_jiaoshi.xingming IS '姓名';
COMMENT ON COLUMN jy_jiaoshi.xingbie IS '性别';
COMMENT ON COLUMN jy_jiaoshi.shenfenzheng IS '身份证号';
COMMENT ON COLUMN jy_jiaoshi.shoujihao IS '手机号';
COMMENT ON COLUMN jy_jiaoshi.youxiang IS '邮箱';
COMMENT ON COLUMN jy_jiaoshi.jiaoshileixing IS '教师类型（正式/临聘/实习）';
COMMENT ON COLUMN jy_jiaoshi.ruzhi_riqi IS '入职日期';
COMMENT ON COLUMN jy_jiaoshi.zhuanye IS '所教专业';
COMMENT ON COLUMN jy_jiaoshi.zhicheng IS '职称';
COMMENT ON COLUMN jy_jiaoshi.jianli IS '个人简历';
COMMENT ON COLUMN jy_jiaoshi.beizhu IS '备注';
COMMENT ON COLUMN jy_jiaoshi.zhuangtai IS '状态（0在职 1离职 2退休）';

CREATE INDEX idx_jy_jiaoshi_yonghu_id ON jy_jiaoshi(yonghu_id);
CREATE INDEX idx_jy_jiaoshi_gonghao ON jy_jiaoshi(gonghao);
CREATE INDEX idx_jy_jiaoshi_zhuangtai ON jy_jiaoshi(zhuangtai);

-- ----------------------------
-- 2. 学生表 jy_xuesheng
-- ----------------------------
CREATE TABLE IF NOT EXISTS jy_xuesheng (
  id SERIAL PRIMARY KEY,
  xuehao VARCHAR(30) NOT NULL UNIQUE,         -- 学号
  xingming VARCHAR(50) NOT NULL,              -- 姓名
  xingbie VARCHAR(10),                        -- 性别
  shengri DATE,                              -- 出生日期
  shenfenzheng VARCHAR(18),                  -- 身份证号
  minzu VARCHAR(20),                         -- 民族
  jiguandanwei VARCHAR(100),                 -- 籍贯/国籍
  jiating_dizhi VARCHAR(200),               -- 家庭地址
  jiazhang_id INT,                           -- 关联家长ID
  banji_id INT,                              -- 关联班级ID
  ruxue_riqi DATE,                           -- 入学日期
  biye_riqi DATE,                            -- 毕业日期
  xuejizhanghao VARCHAR(30),                 -- 学籍账号
  jiankangzhuangkuang VARCHAR(100),         -- 健康状况
  beizhu VARCHAR(500),                      -- 备注
  zhuangtai INT DEFAULT 0,                   -- 状态（0在读 1休学 2毕业 3退学）
  chuangjian_shijian TIMESTAMP DEFAULT NOW(),
  gengxin_shijian TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE jy_xuesheng IS '学生信息表';
COMMENT ON COLUMN jy_xuesheng.xuehao IS '学号';
COMMENT ON COLUMN jy_xuesheng.xingming IS '姓名';
COMMENT ON COLUMN jy_xuesheng.xingbie IS '性别';
COMMENT ON COLUMN jy_xuesheng.shengri IS '出生日期';
COMMENT ON COLUMN jy_xuesheng.shenfenzheng IS '身份证号';
COMMENT ON COLUMN jy_xuesheng.minzu IS '民族';
COMMENT ON COLUMN jy_xuesheng.jiguandanwei IS '籍贯/国籍';
COMMENT ON COLUMN jy_xuesheng.jiating_dizhi IS '家庭地址';
COMMENT ON COLUMN jy_xuesheng.jiazhang_id IS '关联家长ID';
COMMENT ON COLUMN jy_xuesheng.banji_id IS '关联班级ID';
COMMENT ON COLUMN jy_xuesheng.ruxue_riqi IS '入学日期';
COMMENT ON COLUMN jy_xuesheng.biye_riqi IS '毕业日期';
COMMENT ON COLUMN jy_xuesheng.xuejizhanghao IS '学籍账号';
COMMENT ON COLUMN jy_xuesheng.jiankangzhuangkuang IS '健康状况';
COMMENT ON COLUMN jy_xuesheng.zhuangtai IS '状态（0在读 1休学 2毕业 3退学）';

CREATE INDEX idx_jy_xuesheng_xuehao ON jy_xuesheng(xuehao);
CREATE INDEX idx_jy_xuesheng_banji_id ON jy_xuesheng(banji_id);
CREATE INDEX idx_jy_xuesheng_jiazhang_id ON jy_xuesheng(jiazhang_id);
CREATE INDEX idx_jy_xuesheng_zhuangtai ON jy_xuesheng(zhuangtai);

-- ----------------------------
-- 3. 班级表 jy_banji
-- ----------------------------
CREATE TABLE IF NOT EXISTS jy_banji (
  id SERIAL PRIMARY KEY,
  banjibianhao VARCHAR(30) NOT NULL UNIQUE,  -- 班级编号
  banjimingcheng VARCHAR(50) NOT NULL,       -- 班级名称
  fu_banji_id INT,                           -- 父班级ID（用于年级分组）
  banjileixing VARCHAR(20),                   -- 班级类型（教学班/行政班）
  rongliang INT DEFAULT 40,                  -- 容量
  dangji_nianji INT,                         -- 年级
  suoxue_renshu INT DEFAULT 0,               -- 已注册人数
  banji_zhuangtai VARCHAR(20),               -- 班级状态
  fudaoyuan_id INT,                          -- 班主任ID（教师）
  kaishi_riqi DATE,                          -- 开班日期
  jieshu_riqi DATE,                          -- 结束日期
  beizhu VARCHAR(500),
  zhuangtai INT DEFAULT 0,                   -- 状态（0正常 1已毕业 2已解散）
  chuangjian_shijian TIMESTAMP DEFAULT NOW(),
  gengxin_shijian TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE jy_banji IS '班级信息表';
COMMENT ON COLUMN jy_banji.banjibianhao IS '班级编号';
COMMENT ON COLUMN jy_banji.banjimingcheng IS '班级名称';
COMMENT ON COLUMN jy_banji.fu_banji_id IS '父班级ID';
COMMENT ON COLUMN jy_banji.banjileixing IS '班级类型（教学班/行政班）';
COMMENT ON COLUMN jy_banji.rongliang IS '容量';
COMMENT ON COLUMN jy_banji.dangji_nianji IS '年级';
COMMENT ON COLUMN jy_banji.suoxue_renshu IS '已注册人数';
COMMENT ON COLUMN jy_banji.banji_zhuangtai IS '班级状态';
COMMENT ON COLUMN jy_banji.fudaoyuan_id IS '班主任ID';
COMMENT ON COLUMN jy_banji.kaishi_riqi IS '开班日期';
COMMENT ON COLUMN jy_banji.jieshu_riqi IS '结束日期';

CREATE INDEX idx_jy_banji_banjibianhao ON jy_banji(banjibianhao);
CREATE INDEX idx_jy_banji_fu_banji_id ON jy_banji(fu_banji_id);
CREATE INDEX idx_jy_banji_fudaoyuan_id ON jy_banji(fudaoyuan_id);
CREATE INDEX idx_jy_banji_zhuangtai ON jy_banji(zhuangtai);

-- ----------------------------
-- 4. 课程表 jy_kecheng
-- ----------------------------
CREATE TABLE IF NOT EXISTS jy_kecheng (
  id SERIAL PRIMARY KEY,
  kechengbianhao VARCHAR(30) NOT NULL UNIQUE, -- 课程编号
  kechengming VARCHAR(100) NOT NULL,         -- 课程名称
  kechengleixing VARCHAR(20),                 -- 课程类型（必修/选修/实践）
  xuefen INT DEFAULT 0,                       -- 学分
  xueshi INT DEFAULT 0,                       -- 学时
  kechengmiaoshu TEXT,                        -- 课程描述
  fuzeren_id INT,                            -- 负责人ID（教师）
  kaike_xueqi VARCHAR(20),                   -- 开课学期
  kaikedanwei VARCHAR(100),                  -- 开课单位
  kaikeshijian VARCHAR(50),                  -- 上课时间
  kaikedidian VARCHAR(100),                  -- 上课地点
  beizhu VARCHAR(500),
  zhuangtai INT DEFAULT 0,                   -- 状态（0正常 1已停课）
  chuangjian_shijian TIMESTAMP DEFAULT NOW(),
  gengxin_shijian TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE jy_kecheng IS '课程信息表';
COMMENT ON COLUMN jy_kecheng.kechengbianhao IS '课程编号';
COMMENT ON COLUMN jy_kecheng.kechengming IS '课程名称';
COMMENT ON COLUMN jy_kecheng.kechengleixing IS '课程类型（必修/选修/实践）';
COMMENT ON COLUMN jy_kecheng.xuefen IS '学分';
COMMENT ON COLUMN jy_kecheng.xueshi IS '学时';
COMMENT ON COLUMN jy_kecheng.kechengmiaoshu IS '课程描述';
COMMENT ON COLUMN jy_kecheng.fuzeren_id IS '负责人ID';
COMMENT ON COLUMN jy_kecheng.kaike_xueqi IS '开课学期';
COMMENT ON COLUMN jy_kecheng.kaikedanwei IS '开课单位';
COMMENT ON COLUMN jy_kecheng.kaikeshijian IS '上课时间';
COMMENT ON COLUMN jy_kecheng.kaikedidian IS '上课地点';

CREATE INDEX idx_jy_kecheng_kechengbianhao ON jy_kecheng(kechengbianhao);
CREATE INDEX idx_jy_kecheng_fuzeren_id ON jy_kecheng(fuzeren_id);
CREATE INDEX idx_jy_kecheng_zhuangtai ON jy_kecheng(zhuangtai);

-- ----------------------------
-- 5. 教师课程关联表 jy_jiaoshi_kecheng
-- ----------------------------
CREATE TABLE IF NOT EXISTS jy_jiaoshi_kecheng (
  id SERIAL PRIMARY KEY,
  jiaoshi_id INT NOT NULL,                   -- 教师ID
  kecheng_id INT NOT NULL,                   -- 课程ID
  banji_id INT NOT NULL,                     -- 班级ID
  xueqi VARCHAR(20) NOT NULL,                -- 学期
  daike_renshu INT DEFAULT 0,                -- 代课人数
  beizhu VARCHAR(500),
  chuangjian_shijian TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE jy_jiaoshi_kecheng IS '教师课程关联表';
COMMENT ON COLUMN jy_jiaoshi_kecheng.jiaoshi_id IS '教师ID';
COMMENT ON COLUMN jy_jiaoshi_kecheng.kecheng_id IS '课程ID';
COMMENT ON COLUMN jy_jiaoshi_kecheng.banji_id IS '班级ID';
COMMENT ON COLUMN jy_jiaoshi_kecheng.xueqi IS '学期';
COMMENT ON COLUMN jy_jiaoshi_kecheng.daike_renshu IS '代课人数';

CREATE INDEX idx_jk_jiaoshi_id ON jy_jiaoshi_kecheng(jiaoshi_id);
CREATE INDEX idx_jk_kecheng_id ON jy_jiaoshi_kecheng(kecheng_id);
CREATE INDEX idx_jk_banji_id ON jy_jiaoshi_kecheng(banji_id);
CREATE UNIQUE INDEX idx_jk_unique ON jy_jiaoshi_kecheng(jiaoshi_id, kecheng_id, banji_id, xueqi);

-- ----------------------------
-- 6. 成绩表 jy_chengji
-- ----------------------------
CREATE TABLE IF NOT EXISTS jy_chengji (
  id SERIAL PRIMARY KEY,
  xuesheng_id INT NOT NULL,                  -- 学生ID
  kecheng_id INT NOT NULL,                   -- 课程ID
  jiaoshi_id INT,                            -- 教师ID（阅卷）
  xueqi VARCHAR(20) NOT NULL,               -- 学期
  chengguo_leixing VARCHAR(20),             -- 成绩类型（期中/期末/平时/补考）
  fenshu DECIMAL(5,2),                      -- 分数
  dengji VARCHAR(10),                        -- 等级（优/良/中/差）
  paiming INT,                              -- 班级排名
  beizhu VARCHAR(500),
  chuangjian_shijian TIMESTAMP DEFAULT NOW(),
  gengxin_shijian TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE jy_chengji IS '成绩信息表';
COMMENT ON COLUMN jy_chengji.xuesheng_id IS '学生ID';
COMMENT ON COLUMN jy_chengji.kecheng_id IS '课程ID';
COMMENT ON COLUMN jy_chengji.jiaoshi_id IS '教师ID';
COMMENT ON COLUMN jy_chengji.xueqi IS '学期';
COMMENT ON COLUMN jy_chengji.chengguo_leixing IS '成绩类型（期中/期末/平时/补考）';
COMMENT ON COLUMN jy_chengji.fenshu IS '分数';
COMMENT ON COLUMN jy_chengji.dengji IS '等级（优/良/中/差）';
COMMENT ON COLUMN jy_chengji.paiming IS '班级排名';

CREATE INDEX idx_jc_xuesheng_id ON jy_chengji(xuesheng_id);
CREATE INDEX idx_jc_kecheng_id ON jy_chengji(kecheng_id);
CREATE INDEX idx_jc_xueqi ON jy_chengji(xueqi);
CREATE UNIQUE INDEX idx_jc_unique ON jy_chengji(xuesheng_id, kecheng_id, xueqi, chengguo_leixing);

-- ----------------------------
-- 7. 家长表 jy_jiiazhang
-- ----------------------------
CREATE TABLE IF NOT EXISTS jy_jiiazhang (
  id SERIAL PRIMARY KEY,
  yonghu_id INT,                            -- 关联系统用户ID（可选）
  xingming VARCHAR(50) NOT NULL,             -- 家长姓名
  shoujihao VARCHAR(11) NOT NULL,            -- 手机号
  youxiang VARCHAR(100),                      -- 邮箱
  guanxi VARCHAR(20),                        -- 与学生关系（父母/祖父母/其他）
  gongzuodanwei VARCHAR(100),               -- 工作单位
  zhiwu VARCHAR(50),                        -- 职务
  beizhu VARCHAR(500),
  zhuangtai INT DEFAULT 0,                   -- 状态（0正常 1无效）
  chuangjian_shijian TIMESTAMP DEFAULT NOW(),
  gengxin_shijian TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE jy_jiiazhang IS '家长信息表';
COMMENT ON COLUMN jy_jiiazhang.yonghu_id IS '关联系统用户ID';
COMMENT ON COLUMN jy_jiiazhang.xingming IS '家长姓名';
COMMENT ON COLUMN jy_jiiazhang.shoujihao IS '手机号';
COMMENT ON COLUMN jy_jiiazhang.youxiang IS '邮箱';
COMMENT ON COLUMN jy_jiiazhang.guanxi IS '与学生关系';
COMMENT ON COLUMN jy_jiiazhang.gongzuodanwei IS '工作单位';
COMMENT ON COLUMN jy_jiiazhang.zhiwu IS '职务';

CREATE INDEX idx_jj_yonghu_id ON jy_jiiazhang(yonghu_id);
CREATE INDEX idx_jj_shoujihao ON jy_jiiazhang(shoujihao);
CREATE INDEX idx_jj_zhuangtai ON jy_jiiazhang(zhuangtai);

-- ----------------------------
-- 8. 学生家长关联表 jy_xuesheng_jiiazhang
-- ----------------------------
CREATE TABLE IF NOT EXISTS jy_xuesheng_jiiazhang (
  id SERIAL PRIMARY KEY,
  xuesheng_id INT NOT NULL,                  -- 学生ID
  jiazhang_id INT NOT NULL,                  -- 家长ID
  guanxi VARCHAR(20),                        -- 关系（父亲/母亲/其他）
  is_zhuyaojiazhang INT DEFAULT 0,           -- 是否主要联系人（0否 1是）
  beizhu VARCHAR(500)
);

COMMENT ON TABLE jy_xuesheng_jiiazhang IS '学生家长关联表';
COMMENT ON COLUMN jy_xuesheng_jiiazhang.xuesheng_id IS '学生ID';
COMMENT ON COLUMN jy_xuesheng_jiiazhang.jiazhang_id IS '家长ID';
COMMENT ON COLUMN jy_xuesheng_jiiazhang.guanxi IS '关系（父亲/母亲/其他）';
COMMENT ON COLUMN jy_xuesheng_jiiazhang.is_zhuyaojiazhang IS '是否主要联系人';

CREATE INDEX idx_xj_xuesheng_id ON jy_xuesheng_jiiazhang(xuesheng_id);
CREATE INDEX idx_xj_jiazhang_id ON jy_xuesheng_jiiazhang(jiazhang_id);

-- ----------------------------
-- 9. 学期表 jy_xueqi（可选）
-- ----------------------------
CREATE TABLE IF NOT EXISTS jy_xueqi (
  id SERIAL PRIMARY KEY,
  xueqi_bianhao VARCHAR(20) NOT NULL UNIQUE, -- 学期编号
  xueqi_mingcheng VARCHAR(50) NOT NULL,      -- 学期名称
  kaishi_riqi DATE NOT NULL,                 -- 开始日期
  jieshu_riqi DATE NOT NULL,               -- 结束日期
  zhuangtai VARCHAR(20),                      -- 状态（进行中/已结束）
  beizhu VARCHAR(500),
  chuangjian_shijian TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE jy_xueqi IS '学期信息表';
COMMENT ON COLUMN jy_xueqi.xueqi_bianhao IS '学期编号';
COMMENT ON COLUMN jy_xueqi.xueqi_mingcheng IS '学期名称';
COMMENT ON COLUMN jy_xueqi.kaishi_riqi IS '开始日期';
COMMENT ON COLUMN jy_xueqi.jieshu_riqi IS '结束日期';
COMMENT ON COLUMN jy_xueqi.zhuangtai IS '状态（进行中/已结束）';

CREATE INDEX idx_jx_xueqi_bianhao ON jy_xueqi(xueqi_bianhao);
CREATE INDEX idx_jx_zhuangtai ON jy_xueqi(zhuangtai);

-- ----------------------------
-- 10. 添加外键约束
-- ----------------------------
ALTER TABLE jy_jiaoshi ADD CONSTRAINT fk_jiaoshi_yonghu FOREIGN KEY (yonghu_id) REFERENCES xt_yonghu(id) ON DELETE SET NULL;
ALTER TABLE jy_xuesheng ADD CONSTRAINT fk_xuesheng_banji FOREIGN KEY (banji_id) REFERENCES jy_banji(id) ON DELETE SET NULL;
ALTER TABLE jy_xuesheng ADD CONSTRAINT fk_xuesheng_jiazhang FOREIGN KEY (jiazhang_id) REFERENCES jy_jiiazhang(id) ON DELETE SET NULL;
ALTER TABLE jy_banji ADD CONSTRAINT fk_banji_fudaoyuan FOREIGN KEY (fudaoyuan_id) REFERENCES jy_jiaoshi(id) ON DELETE SET NULL;
ALTER TABLE jy_kecheng ADD CONSTRAINT fk_kecheng_fuzeren FOREIGN KEY (fuzeren_id) REFERENCES jy_jiaoshi(id) ON DELETE SET NULL;
ALTER TABLE jy_chengji ADD CONSTRAINT fk_chengji_xuesheng FOREIGN KEY (xuesheng_id) REFERENCES jy_xuesheng(id) ON DELETE CASCADE;
ALTER TABLE jy_chengji ADD CONSTRAINT fk_chengji_kecheng FOREIGN KEY (kecheng_id) REFERENCES jy_kecheng(id) ON DELETE CASCADE;
ALTER TABLE jy_chengji ADD CONSTRAINT fk_chengji_jiaoshi FOREIGN KEY (jiaoshi_id) REFERENCES jy_jiaoshi(id) ON DELETE SET NULL;
ALTER TABLE jy_jiiazhang ADD CONSTRAINT fk_jiiazhang_yonghu FOREIGN KEY (yonghu_id) REFERENCES xt_yonghu(id) ON DELETE SET NULL;

-- ----------------------------
-- 完成提示
-- ----------------------------
SELECT '教育业务表创建完成！' AS 结果;

-- 查看所有表
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
