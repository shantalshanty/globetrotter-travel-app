pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        IMAGE_NAME = 'shantalshanty/globetrotter-app'
        TAG = "${BUILD_NUMBER}"
        CONTAINER_NAME = 'globetrotter'
        PORT = '3001'
    }

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/shantalshanty/globetrotter-travel-app.git'
            }
        }

        stage('Install Dependencies (Node Docker)') {
            steps {
                script {
                    if (isUnix()) {
                        sh '''
                            docker run --rm \
                                -v $PWD:/app \
                                -w /app \
                                node:18 \
                                npm install
                        '''
                    } else {
                        bat '''
                            docker run --rm ^
                                -v %cd%:/app ^
                                -w /app ^
                                node:18 ^
                                npm install
                        '''
                    }
                }
            }
        }

        stage('SAST - Static Analysis') {
            steps {
                script {
                    if (isUnix()) {
                        sh '''
                            docker run --rm -v $PWD:/app -w /app node:18 sh -c "
                                npm install eslint &&
                                npx eslint . || true &&
                                npm audit --audit-level=high || true
                            "
                        '''
                    } else {
                        bat '''
                            docker run --rm -v %cd%:/app -w /app node:18 cmd /c "
                                npm install eslint &&
                                npx eslint . || exit /b 0 &&
                                npm audit --audit-level=high || exit /b 0
                            "
                        '''
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t $IMAGE_NAME:$TAG ."
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'shanty-dockerhub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push $IMAGE_NAME:$TAG
                    '''
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    sh '''
                        docker rm -f globetrotter || true

                        docker run -d -p 3001:3000 \
                            --name globetrotter \
                            $IMAGE_NAME:$TAG

                        echo "Waiting for app..."
                        sleep 5
                    '''
                }
            }
        }

        stage('DAST - OWASP ZAP Scan') {
            steps {
                script {
                    sh '''
                        docker run -t owasp/zap2docker-stable zap-baseline.py \
                        -t http://localhost:3001 \
                        -r zap_report.html || true
                    '''
                }

                archiveArtifacts artifacts: 'zap_report.html', allowEmptyArchive: true
            }
        }
    }

    post {
        success {
            echo '🚀 Pipeline completed successfully!'
        }

        failure {
            echo '❌ Pipeline failed. Check logs.'
        }

        always {
            echo '🧹 Cleaning workspace...'
            cleanWs()
        }
    }
}