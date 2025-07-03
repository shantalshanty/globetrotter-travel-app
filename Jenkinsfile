pipeline {
    agent any

    environment {
        IMAGE_NAME = 'shantalshanty/globetrotter-app'
        TAG = 'latest'
        HOST_PORT = '3001'
        CONTAINER_PORT = '3000'
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
                // Remove old container if exists
                sh 'docker rm -f globetrotter || true'

                // Run new container
                sh "docker run -d -p $HOST_PORT:$CONTAINER_PORT --name globetrotter $IMAGE_NAME:$TAG"
            }
        }
    }

    post {
        success {
            echo "🚀 Deployment and Docker Hub push complete! App running on http://localhost:$HOST_PORT"
        }
        failure {
            echo '❌ Something went wrong. Check logs.'
        }
    }
}
