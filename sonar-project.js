const scanner = require('sonarqube-scanner');

scanner(
  {
    serverUrl: 'https://sonarcloud.io', // For self-hosted: 'http://localhost:9000'
    token: process.env.SONAR_TOKEN,     // Generate in SonarCloud → Account → Security
    options: {
      'sonar.projectKey': 'yourgithubusername_reponame', // From SonarCloud
      'sonar.projectName': 'Your Project Name',
      'sonar.projectDescription': 'Deliverable evaluation dashboard',
      'sonar.sources': 'src',
      'sonar.exclusions': '**/node_modules/**,**/coverage/**',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
    },
  },
  () => process.exit()
);