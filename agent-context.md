# Universal Agent Context -- GitHub Automation

This file provides reusable instructions for an AI agent (such as
Antigravity agents) to safely manage GitHub operations across different
software projects.

The goal is to minimize unnecessary token usage while keeping
repositories synchronized.

------------------------------------------------------------------------

## Purpose

This context file can be reused in **any project**.\
It instructs the agent how to behave when interacting with GitHub.

It should be placed in the **root folder of a project**.

Example:

project-root/ - agent-context.md - package.json - src/ - README.md

------------------------------------------------------------------------

## Agent Responsibilities

When the agent performs GitHub operations it should:

1.  Read this file before performing any repository operation.
2.  Understand the project structure and important files.
3.  Avoid unnecessary processing to reduce token consumption.

------------------------------------------------------------------------

## Intelligent GitHub Workflow

The agent should follow this decision logic:

### Step 1 -- Verify local project

-   Ensure the project builds locally if applicable.
-   Run local checks when available:

npm install\
npm run build\
npm run dev

These checks should be performed **locally first** before requesting any
AI reasoning.

------------------------------------------------------------------------

### Step 2 -- Check if GitHub repository exists

If repository does **NOT exist**:

-   Initialize Git repository
-   Create GitHub repository
-   Push the full project

If repository **already exists**:

-   Detect modified files
-   Commit only changed files
-   Push incremental update

This prevents unnecessary pushes and large token usage.

------------------------------------------------------------------------

## Git Best Practices

The agent should:

-   Use `git status` before committing
-   Commit only modified files
-   Avoid committing build artifacts when unnecessary
-   Keep commit messages concise and descriptive

Example commit message:

"update: project improvements and fixes"

------------------------------------------------------------------------

## Token Optimization Rules

To reduce AI token usage:

-   Avoid scanning the entire repository if not required
-   Only analyze files that were modified
-   Avoid regenerating code unless necessary
-   Perform local validation before using AI reasoning

------------------------------------------------------------------------

## Safety Rules

The agent must:

-   Never delete repositories automatically
-   Never overwrite remote repositories without confirmation
-   Avoid force pushes unless explicitly instructed

------------------------------------------------------------------------

## Compatible Workflows

This file supports:

-   Antigravity agents
-   AI coding assistants
-   Local automation scripts
-   GitHub automation tools

------------------------------------------------------------------------

## Summary

This file enables a **smart AI workflow**:

Local validation → Intelligent Git decision → Minimal token usage → Safe
GitHub synchronization.

It can be reused across **multiple projects without modification**.
