############################################
# codestarconnections
############################################
resource "aws_codestarconnections_connection" "main" {
  name          = "github-connection"
  provider_type = "GitHub"
}

############################################
# codebuild
############################################
resource "aws_codebuild_project" "main" {
  badge_enabled          = false
  build_timeout          = 15
  concurrent_build_limit = 1
  name                   = local.container_name
  project_visibility     = "PRIVATE"
  queued_timeout         = 480
  service_role           = aws_iam_role.codebuild.arn

  artifacts {
    encryption_disabled    = false
    override_artifact_name = false
    type                   = "NO_ARTIFACTS"
  }

  cache {
    modes = [
      "LOCAL_DOCKER_LAYER_CACHE",
      "LOCAL_SOURCE_CACHE",
    ]
    type = "LOCAL"
  }

  environment {
    compute_type    = "BUILD_GENERAL1_SMALL"
    image           = "aws/codebuild/amazonlinux2-x86_64-standard:5.0"
    privileged_mode = false
    type            = "LINUX_CONTAINER"
  }

  logs_config {
    cloudwatch_logs {
      status = "ENABLED"
    }
    s3_logs {
      encryption_disabled = false
      status              = "DISABLED"
    }
  }

  source {
    buildspec           = "buildspec.yml"
    git_clone_depth     = 1
    insecure_ssl        = false
    location            = local.git_url
    report_build_status = false
    type                = "GITHUB"

    git_submodules_config {
      fetch_submodules = false
    }
  }
}

############################################
# codedeploy app
############################################
resource "aws_codedeploy_app" "main" {
  name             = local.container_name
  compute_platform = "ECS"
}

############################################
# codedeploy deploygorup
############################################
resource "aws_codedeploy_deployment_group" "main" {
  app_name               = aws_codedeploy_app.main.name
  deployment_config_name = "CodeDeployDefault.ECSAllAtOnce"
  deployment_group_name  = local.container_name
  service_role_arn       = aws_iam_role.codedeploy.arn

  blue_green_deployment_config {
    deployment_ready_option {
      action_on_timeout = "CONTINUE_DEPLOYMENT"
    }
    terminate_blue_instances_on_deployment_success {
      action                           = "TERMINATE"
      termination_wait_time_in_minutes = 1
    }
  }
  ecs_service {
    cluster_name = aws_ecs_cluster.main.name
    service_name = aws_ecs_service.main.name
  }

  deployment_style {
    deployment_option = "WITH_TRAFFIC_CONTROL"
    deployment_type   = "BLUE_GREEN"
  }

  auto_rollback_configuration {
    enabled = true
    events = [
      "DEPLOYMENT_FAILURE",
      "DEPLOYMENT_STOP_ON_REQUEST",
    ]
  }

  load_balancer_info {
    target_group_pair_info {
      prod_traffic_route {
        listener_arns = [
          aws_lb_listener.main.arn,
        ]
      }
      target_group {
        name = aws_lb_target_group.blue.name
      }
      target_group {
        name = aws_lb_target_group.green.name
      }
    }
  }
}

############################################
# codepipeline
############################################
resource "aws_codepipeline" "main" {
  name          = local.container_name
  pipeline_type = "V2"
  role_arn      = aws_iam_role.codepipeline.arn

  trigger {
    provider_type = "CodeStarSourceConnection"
    git_configuration {
      source_action_name = "Source"
      push {
        file_paths {
          includes = ["./backend/**"]
        }
        branches {
          includes = ["main"]
        }
      }
    }
  }

  artifact_store {
    location = aws_s3_bucket.backend.bucket
    type     = "S3"
  }
  stage {
    name = "Source"
    action {
      category = "Source"
      configuration = {
        "BranchName"           = "main"
        "ConnectionArn"        = aws_codestarconnections_connection.main.arn
        "DetectChanges"        = "false"
        "FullRepositoryId"     = local.repository_id
        "OutputArtifactFormat" = "CODE_ZIP"
      }
      name      = "Source"
      namespace = "SourceVariables"
      output_artifacts = [
        "SourceArtifact",
      ]
      owner     = "AWS"
      provider  = "CodeStarSourceConnection"
      region    = local.region
      run_order = 1
      version   = "1"
    }
  }
  stage {
    name = "Build"
    action {
      category = "Build"
      configuration = {
        "ProjectName" = aws_codebuild_project.main.name
      }
      input_artifacts = [
        "SourceArtifact",
      ]
      name      = "Build"
      namespace = "BuildVariables"
      output_artifacts = [
        "BuildArtifact",
      ]
      owner     = "AWS"
      provider  = "CodeBuild"
      region    = local.region
      run_order = 1
      version   = "1"
    }
  }
  stage {
    name = "Deploy"
    action {
      category = "Deploy"
      configuration = {
        "AppSpecTemplateArtifact"        = "BuildArtifact"
        "ApplicationName"                = aws_codedeploy_app.main.name
        "DeploymentGroupName"            = aws_codedeploy_deployment_group.main.deployment_group_name
        "Image1ArtifactName"             = "BuildArtifact"
        "Image1ContainerName"            = "IMAGE_NAME"
        "TaskDefinitionTemplateArtifact" = "BuildArtifact"
      }
      input_artifacts = [
        "BuildArtifact",
      ]
      name      = "Deploy"
      namespace = "DeployVariables"
      owner     = "AWS"
      provider  = "CodeDeployToECS"
      region    = local.region
      run_order = 1
      version   = "1"
    }
  }
}