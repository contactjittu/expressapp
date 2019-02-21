pipeline {
  agent any
 
  tools {nodejs "NodeJSv10.15.1"}
 
  stages {
        
    stage('Cloning Repo') {
      steps {
        git 'https://github.com/contactjittu/expressapp.git'
      }
    }
        
    stage('Install dependencies') {
      steps {
        sh 'npm install'
      }
    }
     
    stage('Start') {
      steps {
        try {
          sh 'pm2 stop server.js'
          sh 'pm2 start server.js'
        } catch (Exception e) {
          sh 'pm2 start server.js'
        }
      }
    }
  }
}