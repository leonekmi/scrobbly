pipeline {
  agent any
  stages {
    stage('Keys & config') {
      steps {
        sh '''openssl genrsa -out keys/signing.pem 2048
touch secret.json'''
      }
    }
    stage('NPM deps') {
      steps {
        sh 'npm install'
      }
    }
    stage('Grunt') {
      parallel {
        stage('Build .zip/.crx') {
          steps {
            sh 'npx grunt'
          }
        }
        stage('ESLint') {
          steps {
            sh 'npx grunt lint'
          }
        }
      }
    }
    stage('Artefacts') {
      steps {
        archiveArtifacts(artifacts: 'target/*', excludes: 'target/.gitkeep')
      }
    }
  }
}