pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "aditya2888/skillsphere-backend"
        FRONTEND_IMAGE = "aditya2888/skillsphere-frontend"
    }

    stages {

        stage('Prepare') {
            steps {
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
                    bat """
                    docker build -t ${env.BACKEND_IMAGE}:${BUILD_NUMBER} -t ${env.BACKEND_IMAGE}:latest .
                    """
                }

                dir('frontend') {
                    bat """
                    docker build -t ${env.FRONTEND_IMAGE}:${BUILD_NUMBER} -t ${env.FRONTEND_IMAGE}:latest .
                    """
                }

                bat 'docker images'
            }
        }

        stage('Verify Docker Images') {
            steps {
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

        always {
            echo 'Pipeline execution finished.'
        }
    }
}