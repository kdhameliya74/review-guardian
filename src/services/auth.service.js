import { OAuthApp } from '@octokit/oauth-app';
import { Octokit } from "@octokit/rest";
import config from '../config/env.config.js';

class AuthService {
  constructor() {
    this.app = new OAuthApp({
      clientId: config.github.clientId,
      clientSecret: config.github.clientSecret,
    });
  }

  getOctokit(token) {
    if (!this.octokit) {
      this.octokit = new Octokit({
        auth: token,
      });
    }
    return this.octokit;
  }

  /**
   * Exchanges an OAuth code for a user-to-server access token.
   * @param {string} code - The code from the GitHub callback.
   * @returns {Promise<Object>} - The authentication object.
   */
  async exchangeCodeForToken(code) {
    try {
      const { authentication } = await this.app.createToken({
        code,
      });
      return authentication;
    } catch (error) {
      console.error('Error exchanging code for token:', error.message);
      throw new Error('Failed to authorize user with GitHub');
    }
  }

  /**
   * Fetches the authenticated user's profile.
   * @param {string} token - The user's access token.
   * @returns {Promise<Object>} - The user profile.
   */
  async getUserProfile(token) {
    try {
      const octokit = this.getOctokit(token);
      const { data } = await octokit.rest.users.getAuthenticated();
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      throw new Error('Failed to fetch user profile from GitHub');
    }
  }
}

export default new AuthService();
