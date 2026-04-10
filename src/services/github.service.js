import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';
import config from '../config/env.config.js';

export class GitHubService {
  _getOctokit(installationId) {
    if (!installationId) {
      throw new Error('installationId is required for GitHub App authentication');
    }

    return new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: config.github.appId,
        privateKey: config.github.privateKey,
        installationId,
      },
    });
  }

  /**
   * Fetches the diff of a Pull Request
   */
  async getPullRequestDiff(installationId, owner, repo, pullNumber) {
    try {
      const octokit = this._getOctokit(installationId);
      const { data } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
        mediaType: {
          format: 'diff',
        },
      });

      return data;
    } catch (error) {
      console.error('Error fetching PR diff:', error.message);
      throw error;
    }
  }

  _formatSeverityLabel(severity) {
    switch (severity?.toLowerCase()) {
      case 'high':
        return '🚨 **[High]**';
      case 'medium':
        return '⚠️ **[Medium]**';
      case 'low':
        return '💡 **[Low]**';
      default:
        return '📝 **[Note]**';
    }
  }

  // Posts a review with line-specific comments to a Pull Request
  async postReview(installationId, owner, repo, pullNumber, comments, summary = '') {
    const octokit = this._getOctokit(installationId);

    try {
      const reviewPayload = {
        owner,
        repo,
        pull_number: pullNumber,
        event: 'COMMENT',
        body: summary,
        comments: (comments || [])
          .filter(c => (c.path || c.file) && c.line && (c.comment || c.body))
          .map(c => ({
            path: c.path || c.file,
            line: parseInt(c.line, 10),
            body: `${this._formatSeverityLabel(c.severity)} ${c.comment || c.body}`,
          })),
      };

      await octokit.rest.pulls.createReview(reviewPayload);
      console.log('Review posted successfully.');
    } catch (error) {
      console.error('Error posting PR review natively:', error);

      // If line-specific review fails, consolidate everything into a single Markdown comment
      let fallbackBody = `${summary}\n\n---\n\n#### Detailed AI Suggestions\n\n`;

      if (comments && comments.length > 0) {
        comments.forEach(c => {
          const path = c.path || c.file;
          const line = c.line;
          const body = c.comment || c.body;
          fallbackBody += `**File:** \`${path}\` | **Line:** ${line}\n\n${this._formatSeverityLabel(c.severity)} ${body}\n\n---\n`;
        });
      } else {
        fallbackBody += "_No specific line comments._";
      }

      // Falling back to single top-level comment due to line-specific comment error.
      await this.postComment(installationId, owner, repo, pullNumber, fallbackBody);
    }
  }

  /**
   * Posts a top-level comment to a Pull Request
   */
  async postComment(installationId, owner, repo, pullNumber, body) {
    try {
      const octokit = this._getOctokit(installationId);
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body,
      });
      console.log('Fallback top-level comment posted.');
    } catch (error) {
      console.error('Error posting PR comment:', error.message);
    }
  }
}

export default new GitHubService();
