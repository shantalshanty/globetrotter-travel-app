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

    tools {
    nodejs 'node18'
           } 

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/shantalshanty/globetrotter-travel-app.git'
            }
        }

        stage('Install Dependencies') {
    agent {
        docker {
            image 'node:18'
        }
    }
    steps {
        sh 'npm install'
    }
}


        stage('SAST - Static Analysis') {
            steps {
                script {
                    if (isUnix()) {
                        sh '''
                            npm install eslint
                            npx eslint . || true
                            npm audit --audit-level=high || true
                        '''
                    } else {
                        bat '''
                            npm install eslint
                            npx eslint . || exit /b 0
                            npm audit --audit-level=high || exit /b 0
                        '''
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    if (isUnix()) {
                        sh "docker build -t $IMAGE_NAME:$TAG ."
                    } else {
                        bat "docker build -t %IMAGE_NAME%:%TAG% ."
                    }
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
                    script {
                        if (isUnix()) {
                            sh '''
                                echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                                docker push $IMAGE_NAME:$TAG
                            '''
                        } else {
                            bat '''
                                echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                                docker push %IMAGE_NAME%:%TAG%
                            '''
                        }
                    }
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    if (isUnix()) {
                        sh '''
                            docker rm -f $CONTAINER_NAME || true

                            docker run -d -p $PORT:3000 \
                                --name $CONTAINER_NAME \
                                $IMAGE_NAME:$TAG

                            echo "Waiting for application..."
                            sleep 5
                        '''
                    } else {
                        bat '''
                            docker stop globetrotter || exit /b 0
                            docker rm globetrotter || exit /b 0

                            docker run -d -p 3001:3000 --name globetrotter %IMAGE_NAME%:%TAG%

                            timeout /T 5
                        '''
                    }
                }
            }
        }

        stage('DAST - OWASP ZAP Scan') {
            steps {
                script {
                    if (isUnix()) {
                        sh '''
                            docker run -t owasp/zap2docker-stable zap-baseline.py \
                            -t http://host.docker.internal:3001 \
                            -r zap_report.html || true
                        '''
                    } else {
                        bat '''
                            docker run -t owasp/zap2docker-stable zap-baseline.py ^
                            -t http://host.docker.internal:3001 ^
                            -r zap_report.html || exit /b 0
                        '''
                    }
                }

                archiveArtifacts artifacts: 'zap_report.html', allowEmptyArchive: true
            }
        }
    }

    post {
        success {
            echo '🚀 Pipeline completed successfully: Build, Push, Deploy, and Security Scan done!'
        }

        failure {
            echo '❌ Pipeline failed. Check logs for details.'
        }

        always {
            echo '🧹 Cleaning workspace...'
            cleanWs()
        }
    }
}