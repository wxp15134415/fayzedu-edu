-- =====================================================
-- 教育管理系统数据库迁移脚本
-- 阶段一：系统表重命名（中文化）
-- 日期：2026-04-01
-- =====================================================

-- 连接数据库
-- \c nova2;

-- ----------------------------
-- 1. 系统用户表重命名 sys_user → xt_yonghu
-- ----------------------------
ALTER TABLE sys_user RENAME TO xt_yonghu;

-- 字段重命名（可选，保持英文也可以，中文注释已够用）
-- ALTER TABLE xt_yonghu RENAME COLUMN username TO yonghuming;
-- ALTER TABLE xt_yonghu RENAME COLUMN password TO mima;

COMMENT ON TABLE xt_yonghu IS '系统用户表';
COMMENT ON COLUMN xt_yonghu.username IS '用户账号';
COMMENT ON COLUMN xt_yonghu.password IS '密码（加密存储）';
COMMENT ON COLUMN xt_yonghu.nick_name IS '用户昵称';
COMMENT ON COLUMN xt_yonghu.phone IS '手机号码';
COMMENT ON COLUMN xt_yonghu.email IS '用户邮箱';
COMMENT ON COLUMN xt_yonghu.gender IS '用户性别';
COMMENT ON COLUMN xt_yonghu.avatar IS '头像地址';
COMMENT ON COLUMN xt_yonghu.dept_id IS '部门ID';
COMMENT ON COLUMN xt_yonghu.status IS '帐号状态（0正常 1停用）';
COMMENT ON COLUMN xt_yonghu.create_time IS '创建时间';
COMMENT ON COLUMN xt_yonghu.update_time IS '更新时间';
COMMENT ON COLUMN xt_yonghu.remark IS '备注';

-- ----------------------------
-- 2. 系统角色表重命名 sys_role → xt_jiaose
-- ----------------------------
ALTER TABLE sys_role RENAME TO xt_jiaose;

COMMENT ON TABLE xt_jiaose IS '系统角色表';
COMMENT ON COLUMN xt_jiaose.role_name IS '角色名称';
COMMENT ON COLUMN xt_jiaose.role_key IS '角色权限字符串';
COMMENT ON COLUMN xt_jiaose.status IS '角色状态（0正常 1停用）';
COMMENT ON COLUMN xt_jiaose.data_scope IS '数据范围（1全部 2自定 3本部门 4本部门及以下 5仅本人）';
COMMENT ON COLUMN xt_jiaose.create_time IS '创建时间';
COMMENT ON COLUMN xt_jiaose.update_time IS '更新时间';
COMMENT ON COLUMN xt_jiaose.remark IS '备注';

-- ----------------------------
-- 3. 系统菜单表重命名 sys_menu → xt_caidan
-- ----------------------------
ALTER TABLE sys_menu RENAME TO xt_caidan;

-- 删除国际化相关字段（简化设计）
ALTER TABLE xt_caidan DROP COLUMN IF EXISTS i18n_key;

COMMENT ON TABLE xt_caidan IS '系统菜单表';
COMMENT ON COLUMN xt_caidan.title IS '菜单名称';
COMMENT ON COLUMN xt_caidan.parent_id IS '父菜单ID';
COMMENT ON COLUMN xt_caidan.menu_type IS '菜单类型（directory/page/permission）';
COMMENT ON COLUMN xt_caidan.sort IS '显示顺序';
COMMENT ON COLUMN xt_caidan.path IS '路由地址';
COMMENT ON COLUMN xt_caidan.component IS '组件路径';
COMMENT ON COLUMN xt_caidan.active_path IS '高亮菜单路径';
COMMENT ON COLUMN xt_caidan.icon IS '菜单图标';
COMMENT ON COLUMN xt_caidan.menu_visible IS '菜单显示状态';
COMMENT ON COLUMN xt_caidan.tab_visible IS '标签栏显示状态';
COMMENT ON COLUMN xt_caidan.pin_tab IS '是否固定标签页';
COMMENT ON COLUMN xt_caidan.is_link IS '是否为外链';
COMMENT ON COLUMN xt_caidan.link_path IS '外链地址';
COMMENT ON COLUMN xt_caidan.keep_alive IS '是否缓存';
COMMENT ON COLUMN xt_caidan.perms IS '权限标识';
COMMENT ON COLUMN xt_caidan.status IS '菜单状态（0正常 1停用）';
COMMENT ON COLUMN xt_caidan.create_time IS '创建时间';
COMMENT ON COLUMN xt_caidan.update_time IS '更新时间';
COMMENT ON COLUMN xt_caidan.remark IS '备注';

-- ----------------------------
-- 4. 组织机构表重命名 sys_dept → zz_jigou
-- ----------------------------
ALTER TABLE sys_dept RENAME TO zz_jigou;

COMMENT ON TABLE zz_jigou IS '组织机构表';
COMMENT ON COLUMN zz_jigou.dept_name IS '机构名称';
COMMENT ON COLUMN zz_jigou.parent_id IS '父机构ID';
COMMENT ON COLUMN zz_jigou.ancestors IS '祖级列表';
COMMENT ON COLUMN zz_jigou.sort IS '显示顺序';
COMMENT ON COLUMN zz_jigou.leader IS '负责人';
COMMENT ON COLUMN zz_jigou.phone IS '联系电话';
COMMENT ON COLUMN zz_jigou.email IS '邮箱';
COMMENT ON COLUMN zz_jigou.status IS '机构状态（0正常 1停用）';
COMMENT ON COLUMN zz_jigou.create_time IS '创建时间';
COMMENT ON COLUMN zz_jigou.update_time IS '更新时间';
COMMENT ON COLUMN zz_jigou.remark IS '备注';

-- ----------------------------
-- 5. 字典类型表重命名 sys_dict_type → sj_zidian_leixing
-- ----------------------------
ALTER TABLE sys_dict_type RENAME TO sj_zidian_leixing;

COMMENT ON TABLE sj_zidian_leixing IS '字典类型表';
COMMENT ON COLUMN sj_zidian_leixing.name IS '字典名称';
COMMENT ON COLUMN sj_zidian_leixing.type IS '字典类型';
COMMENT ON COLUMN sj_zidian_leixing.status IS '状态（0正常 1停用）';
COMMENT ON COLUMN sj_zidian_leixing.create_time IS '创建时间';
COMMENT ON COLUMN sj_zidian_leixing.update_time IS '更新时间';
COMMENT ON COLUMN sj_zidian_leixing.remark IS '备注';

-- ----------------------------
-- 6. 字典数据表重命名 sys_dict_data → sj_zidian_shuju
-- ----------------------------
ALTER TABLE sys_dict_data RENAME TO sj_zidian_shuju;

COMMENT ON TABLE sj_zidian_shuju IS '字典数据表';
COMMENT ON COLUMN sj_zidian_shuju.name IS '字典标签';
COMMENT ON COLUMN sj_zidian_shuju.value IS '字典键值';
COMMENT ON COLUMN sj_zidian_shuju.dict_type IS '字典类型';
COMMENT ON COLUMN sj_zidian_shuju.sort IS '字典排序';
COMMENT ON COLUMN sj_zidian_shuju.status IS '状态（0正常 1停用）';
COMMENT ON COLUMN sj_zidian_shuju.create_time IS '创建时间';
COMMENT ON COLUMN sj_zidian_shuju.update_time IS '更新时间';
COMMENT ON COLUMN sj_zidian_shuju.remark IS '备注';

-- ----------------------------
-- 7. 登录日志表重命名 sys_login_log → dl_rizhi
-- ----------------------------
ALTER TABLE sys_login_log RENAME TO dl_rizhi;

COMMENT ON TABLE dl_rizhi IS '登录日志表';
COMMENT ON COLUMN dl_rizhi.username IS '用户账号';
COMMENT ON COLUMN dl_rizhi.ipaddr IS '登录IP地址';
COMMENT ON COLUMN dl_rizhi.login_location IS '登录地点';
COMMENT ON COLUMN dl_rizhi.browser IS '浏览器类型';
COMMENT ON COLUMN dl_rizhi.os IS '操作系统';
COMMENT ON COLUMN dl_rizhi.status IS '登录状态（0成功 1失败）';
COMMENT ON COLUMN dl_rizhi.msg IS '提示消息';
COMMENT ON COLUMN dl_rizhi.login_time IS '访问时间';

-- ----------------------------
-- 8. 关联表重命名
-- ----------------------------
ALTER TABLE sys_user_role RENAME TO xt_yonghu_jiaose;
ALTER TABLE sys_role_menu RENAME TO xt_jiaose_caidan;
ALTER TABLE sys_role_dept RENAME TO xt_jiaose_jigou;

COMMENT ON TABLE xt_yonghu_jiaose IS '用户角色关联表';
COMMENT ON TABLE xt_jiaose_caidan IS '角色菜单关联表';
COMMENT ON TABLE xt_jiaose_jigou IS '角色机构关联表';

-- ----------------------------
-- 9. 添加新的系统用户字段（用于中文化业务扩展）
-- ----------------------------
ALTER TABLE xt_yonghu ADD COLUMN IF NOT EXISTS xingming VARCHAR(50);  -- 真实姓名
ALTER TABLE xt_yonghu ADD COLUMN IF NOT EXISTS shenfenzheng VARCHAR(18);  -- 身份证号
ALTER TABLE xt_yonghu ADD COLUMN IF NOT EXISTS yonghuleixing VARCHAR(20);  -- 用户类型（系统用户/教师/家长）

COMMENT ON COLUMN xt_yonghu.xingming IS '真实姓名';
COMMENT ON COLUMN xt_yonghu.shenfenzheng IS '身份证号';
COMMENT ON COLUMN xt_yonghu.yonghuleixing IS '用户类型';

-- ----------------------------
-- 10. 更新序列名称以匹配新表名
-- ----------------------------
ALTER SEQUENCE sys_user_id_seq RENAME TO xt_yonghu_id_seq;
ALTER SEQUENCE sys_role_id_seq RENAME TO xt_jiaose_id_seq;
ALTER SEQUENCE sys_menu_id_seq RENAME TO xt_caidan_id_seq;
ALTER SEQUENCE sys_dept_id_seq RENAME TO zz_jigou_id_seq;
ALTER SEQUENCE sys_dict_type_id_seq RENAME TO sj_zidian_leixing_id_seq;
ALTER SEQUENCE sys_dict_data_id_seq RENAME TO sj_zidian_shuju_id_seq;

-- ----------------------------
-- 完成提示
-- ----------------------------
SELECT '系统表重命名完成！' AS 结果;
