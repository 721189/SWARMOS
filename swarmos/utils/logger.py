"""
SWARMOS Telemetry & Logger Utility.
Provides colorized terminal output and structured event logging for swarm operations.
"""

import sys
import logging
from datetime import datetime

class SwarmFormatter(logging.Formatter):
    GREY = "\x1b[38;20m"
    BLUE = "\x1b[34;20m"
    YELLOW = "\x1b[33;20m"
    RED = "\x1b[31;20m"
    BOLD_RED = "\x1b[31;1m"
    GREEN = "\x1b[32;20m"
    CYAN = "\x1b[36;20m"
    RESET = "\x1b[0m"

    FORMATS = {
        logging.DEBUG: GREY + "[%(asctime)s] [DEBUG] %(message)s" + RESET,
        logging.INFO: CYAN + "[%(asctime)s] [SWARM-OS] %(message)s" + RESET,
        logging.WARNING: YELLOW + "[%(asctime)s] [ALERT] %(message)s" + RESET,
        logging.ERROR: RED + "[%(asctime)s] [FAILURE] %(message)s" + RESET,
        logging.CRITICAL: BOLD_RED + "[%(asctime)s] [CRITICAL] %(message)s" + RESET
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno, self.FORMATS[logging.INFO])
        formatter = logging.Formatter(log_fmt, datefmt="%H:%M:%S")
        return formatter.format(record)

def get_logger(name: str = "SWARMOS") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.DEBUG)
        ch = logging.StreamHandler(sys.stdout)
        ch.setLevel(logging.DEBUG)
        ch.setFormatter(SwarmFormatter())
        logger.addHandler(ch)
    return logger

logger = get_logger("SWARMOS")
