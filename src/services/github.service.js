import { Octokit } from 'octokit';
import config from '../config/env.config.js';

/**
 * Service to interact with the GitHub API using Octokit
 */
export class GitHubService {
  constructor() {
    this.octokit = this._initializeOctokit();
  }

  /**
   * Initialize Octokit with either PAT or GitHub App credentials
   */
  _initializeOctokit() {
    const { personalAccessToken, appId, privateKey } = config.github;

    if (personalAccessToken) {
      console.log('GitHub Service: Authenticating using Personal Access Token (PAT)');
      return new Octokit({ auth: personalAccessToken });
    }

    if (appId && privateKey) {
      console.log('GitHub Service: Authenticating using GitHub App credentials');
      // For a GitHub App, we would typically use @octokit/auth-app
      // but to keep it simple and within the same 'octokit' package:
      return new Octokit({
        authStrategy: null, // Placeholder for App Auth if needed
        auth: {
          appId,
          privateKey,
        }
      });
    }

    console.warn('GitHub Service: No valid authentication found. API calls may fail.');
    return new Octokit();
  }

  /**
   * Fetches the diff of a Pull Request
   */
  async getPullRequestDiff(owner, repo, pullNumber) {
    try {
      console.log(`Fetching diff for PR #${pullNumber} in ${owner}/${repo}`);
      
      const { data } = await this.octokit.rest.pulls.get({
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

  /**
   * Posts a review with line-specific comments to a Pull Request
   * @param {string} owner 
   * @param {string} repo 
   * @param {number} pullNumber 
   * @param {Array} comments Array of { path, line, body }
   */
  async postReview(owner, repo, pullNumber, comments) {
    try {
      console.log(`Posting review to PR #${pullNumber} with ${comments.length} comments`);
      
      await this.octokit.rest.pulls.createReview({
        owner,
        repo,
        pull_number: pullNumber,
        event: 'COMMENT',
        comments: comments.map(c => ({
          path: c.path || c.file, // Support both 'path' and 'file' naming
          line: c.line,
          body: c.comment || c.body,
        })),
      });

      console.log('Review posted successfully.');
    } catch (error) {
      console.error('Error posting PR review:', error);
      // Fallback: post a single top-level comment if review fails
      await this.postComment(owner, repo, pullNumber, 'AI Review completed, but encountered an error posting line comments.');
    }
  }

  /**
   * Posts a top-level comment to a Pull Request
   */
  async postComment(owner, repo, pullNumber, body) {
    try {
      await this.octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body,
      });
    } catch (error) {
      console.error('Error posting PR comment:', error.message);
    }
  }
}

export default new GitHubService();
