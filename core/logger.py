"""
Centralized logging configuration.

Call ``setup_logging()`` once at application startup.
Use ``get_logger(name)`` in every module to obtain a child logger.
"""

from __future__ import annotations

import logging
import sys

_LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
_DATE_FORMAT = "%H:%M:%S"
_ROOT_LOGGER_NAME = "pdf_screen_shotter"

_is_configured: bool = False


def setup_logging(*, level: int = logging.DEBUG) -> None:
    """Configure the root application logger with a stream handler.

    Safe to call multiple times — subsequent calls are no-ops.
    """
    global _is_configured
    if _is_configured:
        return

    root = logging.getLogger(_ROOT_LOGGER_NAME)
    root.setLevel(level)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)
    handler.setFormatter(logging.Formatter(_LOG_FORMAT, datefmt=_DATE_FORMAT))
    root.addHandler(handler)

    _is_configured = True


def get_logger(name: str) -> logging.Logger:
    """Return a child logger under the application root.

    Args:
        name: Typically ``__name__`` of the calling module.
    """
    return logging.getLogger(f"{_ROOT_LOGGER_NAME}.{name}")
