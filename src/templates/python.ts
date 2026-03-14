import { TemplateConfig } from './index';

export const pythonTemplate: TemplateConfig = {
  name: 'python',
  description: 'Plantilla para proyectos Python',
  directories: ['src', 'tests', 'docs'],
  files: [
    {
      path: 'pyproject.toml',
      content: `[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "{{PROJECT_NAME}}"
version = "0.1.0"
description = "Proyecto Python con heartbeats"
readme = "README.md"
requires-python = ">=3.9"
license = {text = "MIT"}
authors = [
    {name = "Your Name", email = "your@email.com"}
]
classifiers = [
    "Development Status :: 3 - Alpha",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-cov>=4.0.0",
    "black>=23.0.0",
    "ruff>=0.1.0",
    "mypy>=1.0.0",
]

[project.scripts]
{{PROJECT_NAME}} = "{{PROJECT_NAME}}.cli:main"

[tool.setuptools.packages.find]
where = ["src"]

[tool.black]
line-length = 88
target-version = ['py39', 'py310', 'py311', 'py312']

[tool.ruff]
line-length = 88
select = ["E", "F", "W", "I", "N", "UP", "B", "C4"]

[tool.mypy]
python_version = "3.9"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_functions = ["test_*"]
addopts = "-v --cov=src --cov-report=term-missing"
`,
    },
    {
      path: 'src/{{PROJECT_NAME}}/__init__.py',
      content: `"""
{{PROJECT_NAME}} - Proyecto Python con sistema de heartbeats.
"""

__version__ = "0.1.0"
__author__ = "Your Name"

from .main import greet

__all__ = ["greet", "__version__"]
`,
    },
    {
      path: 'src/{{PROJECT_NAME}}/main.py',
      content: `"""
Módulo principal de {{PROJECT_NAME}}.
"""

def greet(name: str = "World") -> str:
    """
    Saluda a alguien.
    
    Args:
        name: Nombre de la persona a saludar.
        
    Returns:
        Saludo personalizado.
    """
    return f"Hello, {name}!"


def main() -> None:
    """Punto de entrada del CLI."""
    print(greet())


if __name__ == "__main__":
    main()
`,
    },
    {
      path: 'tests/__init__.py',
      content: `"""Tests package."""
`,
    },
    {
      path: 'tests/test_main.py',
      content: `"""Tests para el módulo principal."""

import pytest
from {{PROJECT_NAME}} import greet


def test_greet_default():
    """Test greeting with default name."""
    assert greet() == "Hello, World!"


def test_greet_custom():
    """Test greeting with custom name."""
    assert greet("Alice") == "Hello, Alice!"


def test_greet_empty():
    """Test greeting with empty name."""
    assert greet("") == "Hello, !"
`,
    },
    {
      path: 'heartbeat.config.json',
      content: `{
  "name": "{{PROJECT_NAME}}",
  "version": "0.1.0",
  "heartbeat": {
    "interval": 300000,
    "maxRetries": 3,
    "timeout": 60000
  },
  "ollama": {
    "enabled": true,
    "baseUrl": "http://localhost:11434",
    "model": "llama3"
  },
  "logging": {
    "level": "info",
    "file": "heartbeat.log"
  },
  "python": {
    "version": ">=3.9",
    "virtualEnv": "venv"
  }
}`,
    },
    {
      path: 'GOALS.md',
      content: `# GOALS.md - {{PROJECT_NAME}}

## Fase Actual: Inicialización

### Objetivo Principal

Establecer la infraestructura base del proyecto Python.

### Metas

- [ ] Crear entorno virtual (\`python -m venv venv\`)
- [ ] Instalar dependencias (\`pip install -e ".[dev]"\`)
- [ ] Ejecutar tests (\`pytest\`)
- [ ] Configurar CI/CD

## Milestones

### v0.1.0 - MVP

- [ ] Funcionalidad básica
- [ ] Tests unitarios (>80% coverage)
- [ ] Documentación inicial

---
*Creado: {{DATE}}*
`,
    },
    {
      path: 'HEARTBEAT_COUNTER.md',
      content: `# HEARTBEAT_COUNTER.md

Contador de heartbeats para {{PROJECT_NAME}}.

## Estado Actual

**Contador:** 1

## Historial

| # | Fecha | Modo | Acción |
|---|------|------|--------|
| 1 | {{DATE}} | A | Inicialización del proyecto |

---
*Actualizado automáticamente.*
`,
    },
    {
      path: '.gitignore',
      content: `# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class*

# Virtual environment
venv/
.venv/
env/
.env/

# Distribution / packaging
dist/
build/
*.egg-info/
.eggs/

# Testing
.pytest_cache/
.coverage
htmlcov/
.tox/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
heartbeat.log
`,
    },
  ],
};