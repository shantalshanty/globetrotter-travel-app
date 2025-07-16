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
                script {
                    if (isUnix()) {
                        sh 'npm install'
                    } else {
                        bat 'npm install'
                    }
                }
            }
        }

        stage('SAST - Static Analysis') {
            steps {
                echo '🔍 Running Static Code Analysis...'
                script {
                    if (isUnix()) {
                        sh 'npm install eslint'
                        sh './node_modules/.bin/eslint . || true'
                        sh 'npm audit --audit-level=high || true'
                    } else {
                        bat 'npm install eslint'
                        bat 'npx eslint . || exit /b 0'
                        bat 'npm audit --audit-level=high || exit /b 0'
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
                withCredentials([usernamePassword(credentialsId: 'shanty-dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    script {
                        if (isUnix()) {
                            sh '''
                                echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                                docker push $IMAGE_NAME:$TAG
                            '''
                        } else {
                            bat """
                                echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                                docker push %IMAGE_NAME%:%TAG%
                            """
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
                            docker rm -f globetrotter || true

                            PORT_IN_USE=$(lsof -ti:3001 || true)
                            if [ ! -z "$PORT_IN_USE" ]; then
                                echo "Killing process on port 3001"
                                kill -9 $PORT_IN_USE
                            fi

                            sleep 2

                            docker run -d -p 3001:3000 --name globetrotter $IMAGE_NAME:$TAG
                        '''
                    } else {
                        bat """
                            docker stop globetrotter || exit /b 0
                            docker rm globetrotter || exit /b 0

                            FOR /F "tokens=5" %%P IN ('netstat -aon ^| findstr :3001') DO (
                                taskkill /F /PID %%P
                            )
                            timeout /T 2

                            docker run -d -p 3001:3000 --name globetrotter %IMAGE_NAME%:%TAG%
                        """
                    }
                }
            }
        }

        stage('DAST - OWASP ZAP Scan') {
            steps {
                echo '🛡️ Running OWASP ZAP scan...'
                script {
                    if (isUnix()) {
                        sh '''
                            docker run -t --network="host" owasp/zap2docker-stable zap-baseline.py \
                            -t http://localhost:3001 \
                            -g gen.conf -r zap_report.html || true
                        '''
                    } else {
                        bat """
                            docker run -t --network="host" owasp/zap2docker-stable zap-baseline.py ^
                            -t http://host.docker.internal:3001 ^
                            -g gen.conf -r zap_report.html || exit /b 0
                        """
                    }
                }
                archiveArtifacts artifacts: 'zap_report.html', allowEmptyArchive: true
            }
        }
    }

    post {
        success {
            echo '✅ Deployment, Docker Hub push, and security checks complete!'
        }
        failure {
            echo '❌ Build failed. Please check the logs.'
        }
    }
}
