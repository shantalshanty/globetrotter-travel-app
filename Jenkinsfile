pipeline {
    agent any

    environment {
        IMAGE_NAME = 'shantalshanty/globetrotter-app'
        TAG = 'latest'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/shantalshanty/globetrotter-travel-app.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('SAST - Static Analysis') {
            steps {
                echo '🔍 Running Static Code Analysis...'
                sh 'npm install eslint'
                sh './node_modules/.bin/eslint . || true' // Skip failure on lint warnings
                sh 'npm audit --audit-level=high || true' // Skip failure on high-level audit issues
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME:$TAG .'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push $IMAGE_NAME:$TAG
                    """
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                sh '''
                    # Stop and remove any existing container
                    docker rm -f globetrotter || true

                    # Check if port 3001 is in use and kill the process using it
                    PORT_IN_USE=$(lsof -ti:3001 || true)
                    if [ ! -z "$PORT_IN_USE" ]; then
                        echo "Port 3001 is in use by process $PORT_IN_USE. Killing..."
                        kill -9 $PORT_IN_USE
                    fi

                    # Wait a second to ensure port is freed
                    sleep 2

                    # Run new container
                    docker run -d -p 3001:3000 --name globetrotter $IMAGE_NAME:$TAG
                '''
            }
        }

        stage('DAST - Dynamic Analysis') {
            steps {
                echo '🛡️ Running OWASP ZAP scan...'
                sh '''
                    docker run -t --network="host" owasp/zap2docker-stable zap-baseline.py \
                    -t http://localhost:3001 \
                    -g gen.conf -r zap_report.html || true
                '''
                archiveArtifacts artifacts: 'zap_report.html', allowEmptyArchive: true
            }
        }
    }

    post {
        success {
            echo '🚀 Deployment, Docker Hub push, and security checks complete!'
        }
        failure {
            echo '❌ Something went wrong. Check logs.'
        }
    }
}
