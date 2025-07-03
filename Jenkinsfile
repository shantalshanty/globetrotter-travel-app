pipeline {
    agent any

    environment {
        IMAGE_NAME = 'shantalshanty/globetrotter-app'
        TAG = 'latest'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git 'https://github.com/shantalshanty/globetrotter-travel-app.git'
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
                sh 'docker run -d -p 3000:3000 --name globetrotter $IMAGE_NAME:$TAG'
            }
        }
    }

    post {
        success {
            echo '🚀 Deployment and Docker Hub push complete!'
        }
        failure {
            echo '❌ Something went wrong. Check logs.'
        }
    }
}
