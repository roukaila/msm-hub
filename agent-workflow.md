# Universal AI Agent Workflow Context

Reusable instruction file for AI coding agents working on any software
project. Designed for GitHub automation, project maintenance, deployment
tasks, and safe execution.

This file defines a **smart execution rule** used across all tasks:

IF EXISTS → UPDATE / REUSE\
IF NOT EXISTS → CREATE

This prevents redundant work and reduces AI token usage.

------------------------------------------------------------------------

# Core Execution Principle

For any operation the agent performs:

1.  Check if the resource already exists
2.  If it exists → reuse, update, or extend it
3.  If it does not exist → create it

Pseudo‑logic:

IF file exists\
update file\
ELSE\
create file

This rule applies to:

-   files
-   folders
-   repositories
-   services
-   configurations
-   deployments

------------------------------------------------------------------------

# Project Initialization

When starting work on a project:

IF git repository exists\
pull latest changes\
ELSE\
initialize git repository

IF GitHub repo exists\
connect to it\
ELSE\
create GitHub repository

------------------------------------------------------------------------

# File Management Strategy

Before creating files:

IF file exists\
analyze contents\
modify only necessary sections\
ELSE\
create the file

Common files checked:

README.md\
package.json\
requirements.txt\
.env.example\
docker-compose.yml

------------------------------------------------------------------------

# Dependency Installation

For Node / Python / other stacks

IF dependencies installed\
skip installation\
ELSE\
install dependencies

Examples:

npm install\
pip install -r requirements.txt

------------------------------------------------------------------------

# Build Process

Before building:

IF build artifacts exist and are valid\
reuse build\
ELSE\
run build process

Examples:

npm run build\
next build

------------------------------------------------------------------------

# Testing

Before running tests:

IF test suite exists\
execute tests\
ELSE\
suggest creating tests

------------------------------------------------------------------------

# Deployment Logic

Before deploying:

IF deployment configuration exists\
reuse configuration\
ELSE\
generate deployment configuration

Possible targets:

Vercel\
Docker\
AWS\
DigitalOcean\
GitHub Pages

------------------------------------------------------------------------

# Git Workflow

Before pushing code:

git status

IF changes detected\
commit modified files\
push changes\
ELSE\
do nothing

Avoid unnecessary commits.

------------------------------------------------------------------------

# AI Token Optimization

To minimize token usage:

Do NOT analyze entire repositories unnecessarily.

Only inspect:

-   modified files
-   configuration files
-   relevant modules

Prefer:

incremental reasoning\
local execution first

------------------------------------------------------------------------

# Error Recovery Strategy

If a command fails:

1.  Read error output
2.  Attempt minimal fix
3.  Retry operation

Pseudo‑logic:

TRY operation

IF error\
analyze error\
apply fix\
retry

------------------------------------------------------------------------

# Security Rules

The agent must never:

-   delete repositories automatically
-   overwrite remote repositories
-   expose secrets
-   modify .env files without permission

------------------------------------------------------------------------

# Compatible Agents

This context file works with:

Antigravity agents\
AI coding assistants\
CLI automation tools\
local development bots

------------------------------------------------------------------------

# Recommended Placement

Place this file at project root:

project/ agent-workflow.md README.md src/ package.json

------------------------------------------------------------------------

# Summary

The universal automation rule:

CHECK → REUSE → UPDATE\
ELSE → CREATE

This produces:

-   safer automation
-   faster execution
-   reduced AI token consumption
-   reusable workflow across all projects
