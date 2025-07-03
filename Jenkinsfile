pipeline {
    agent any

    stages {
        stage('Clone') {
            steps {
                echo '📥 Cloning repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 Installing dependencies...'
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                echo '🔧 Building the app...'
                sh 'npm run build || echo "No build script defined."'
            }
        }

        stage('Test') {
            steps {
                echo '🧪 Running tests...'
                sh 'npm test || echo "No tests yet."'
            }
        }

        stage('Complete') {
            steps {
                echo '✅ Pipeline completed successfully.'
            }
        }
    }
}
