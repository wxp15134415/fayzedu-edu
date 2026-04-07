"""
匹配规则配置管理模块
支持从JSON文件加载匹配策略配置，并提供运行时更新能力
"""
import json
import os
from typing import List, Dict, Any, Optional
from pathlib import Path
from app.core.logging import logger


class MatchingStrategy:
    """匹配策略"""

    def __init__(self, config: Dict[str, Any]):
        self.name = config.get('name', '')
        self.code = config.get('code', '')
        self.priority = config.get('priority', 0)
        self.enabled = config.get('enabled', True)
        self.description = config.get('description', '')
        self.fields = config.get('fields', [])
        self.options = config.get('options', {})

    def is_enabled(self) -> bool:
        return self.enabled

    def get_priority(self) -> int:
        return self.priority


class MatchingConfig:
    """匹配配置管理器"""

    _instance = None
    _config: Dict[str, Any] = {}
    _strategies: List[MatchingStrategy] = []
    _config_file: str = ""

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._config:
            self._load_config()

    def _load_config(self):
        """加载配置文件"""
        # 优先从环境变量读取配置路径
        config_path = os.environ.get('MATCHING_CONFIG_PATH')

        if not config_path:
            # 默认路径：相对于当前文件
            base_dir = Path(__file__).parent.parent
            config_path = base_dir / "core" / "matching_config.json"

        self._config_file = str(config_path)

        try:
            with open(self._config_file, 'r', encoding='utf-8') as f:
                self._config = json.load(f)

            # 解析策略列表
            self._strategies = [
                MatchingStrategy(s)
                for s in self._config.get('strategies', [])
            ]

            # 按优先级排序
            self._strategies.sort(key=lambda x: x.get_priority())

            logger.info(f"匹配配置加载成功: {len(self._strategies)} 个策略")
            logger.info(f"配置文件: {self._config_file}")

        except FileNotFoundError:
            logger.warning(f"匹配配置文件不存在: {self._config_file}，使用默认配置")
            self._load_default_config()
        except json.JSONDecodeError as e:
            logger.error(f"匹配配置文件格式错误: {e}，使用默认配置")
            self._load_default_config()

    def _load_default_config(self):
        """加载默认配置"""
        self._config = {
            "enabled": True,
            "strategies": [
                {"name": "考号", "code": "student_no", "priority": 1, "enabled": True},
                {"name": "学籍辅号(去H)", "code": "student_id_no_h", "priority": 2, "enabled": True},
                {"name": "学籍辅号", "code": "student_id", "priority": 3, "enabled": True},
                {"name": "班级+姓名", "code": "class_name", "priority": 4, "enabled": True}
            ]
        }
        self._strategies = [
            MatchingStrategy(s)
            for s in self._config.get('strategies', [])
        ]

    def reload(self):
        """重新加载配置"""
        logger.info("重新加载匹配配置...")
        self._load_config()

    def is_enabled(self) -> bool:
        """检查匹配功能是否启用"""
        return self._config.get('enabled', True)

    def get_enabled_strategies(self) -> List[MatchingStrategy]:
        """获取启用的策略列表（按优先级排序）"""
        return [s for s in self._strategies if s.is_enabled()]

    def get_all_strategies(self) -> List[MatchingStrategy]:
        """获取所有策略列表"""
        return self._strategies

    def get_strategy_by_code(self, code: str) -> Optional[MatchingStrategy]:
        """根据code获取策略"""
        for strategy in self._strategies:
            if strategy.code == code:
                return strategy
        return None

    def get_strategy_codes(self) -> List[str]:
        """获取所有策略的code列表（按优先级）"""
        return [s.code for s in self._strategies]

    def update_strategy(self, code: str, enabled: bool = None, priority: int = None) -> bool:
        """更新策略配置"""
        for strategy_data in self._config.get('strategies', []):
            if strategy_data.get('code') == code:
                if enabled is not None:
                    strategy_data['enabled'] = enabled
                if priority is not None:
                    strategy_data['priority'] = priority
                # 重新加载配置
                self._load_config()
                logger.info(f"更新策略 {code}: enabled={enabled}, priority={priority}")
                return True
        return False

    def save_config(self) -> bool:
        """保存配置到文件"""
        try:
            with open(self._config_file, 'w', encoding='utf-8') as f:
                json.dump(self._config, f, ensure_ascii=False, indent=2)
            logger.info(f"匹配配置已保存: {self._config_file}")
            return True
        except Exception as e:
            logger.error(f"保存匹配配置失败: {e}")
            return False

    def get_config_dict(self) -> Dict[str, Any]:
        """获取配置字典（用于API返回）"""
        return {
            "enabled": self._config.get('enabled', True),
            "strategies": [
                {
                    "name": s.name,
                    "code": s.code,
                    "priority": s.priority,
                    "enabled": s.enabled,
                    "description": s.description,
                    "fields": s.fields
                }
                for s in self._strategies
            ]
        }

    def update_config(self, config: Dict[str, Any]) -> bool:
        """更新整个配置"""
        try:
            if 'enabled' in config:
                self._config['enabled'] = config['enabled']

            if 'strategies' in config:
                # 验证并更新策略
                new_strategies = []
                for s in config['strategies']:
                    if all(k in s for k in ['name', 'code', 'priority']):
                        new_strategies.append(s)

                if new_strategies:
                    self._config['strategies'] = new_strategies

            return self.save_config()
        except Exception as e:
            logger.error(f"更新匹配配置失败: {e}")
            return False


# 全局配置实例
matching_config = MatchingConfig()
