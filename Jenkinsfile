pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    parameters {
        string(name: 'DOCKERHUB_NAMESPACE', defaultValue: 'aditya2888', description: 'Docker Hub namespace')
    }

    environment {
        BACKEND_IMAGE = ''
        FRONTEND_IMAGE = ''
    }

    stages {

        stage('Prepare') {
            steps {
                script {
                    env.BACKEND_IMAGE = "${params.DOCKERHUB_NAMESPACE}/skillsphere-backend"
                    env.FRONTEND_IMAGE = "${params.DOCKERHUB_NAMESPACE}/skillsphere-frontend"
                }

                echo "Backend Image: ${env.BACKEND_IMAGE}"
                echo "Frontend Image: ${env.FRONTEND_IMAGE}"
            }
        }

        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Install and Verify') {
            steps {

                dir('backend') {
                    bat 'npm ci'
                    bat 'node --check index.js'
                }

                dir('frontend') {
                    bat 'npm ci'
                    bat 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            steps {

                dir('backend') {
                    bat "docker build -t %BACKEND_IMAGE%:%BUILD_NUMBER% -t %BACKEND_IMAGE%:latest ."
                }

                dir('frontend') {
                    bat "docker build -t %FRONTEND_IMAGE%:%BUILD_NUMBER% -t %FRONTEND_IMAGE%:latest ."
                }

                bat 'docker images'
            }
        }
    }

    post {

        success {
            echo 'Build completed successfully.'
        }

        failure {
            echo 'Build failed. Check console output.'
        }
    }
}