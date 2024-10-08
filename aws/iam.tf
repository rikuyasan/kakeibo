############################################
# IAM role(codebuild)
############################################

# assume_roleポリシーの作成
data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["codebuild.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

# ecsポリシーの作成
data "aws_iam_policy_document" "ecs" {
  statement {
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:CompleteLayerUpload",
      "ecr:GetAuthorizationToken",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart"
    ]
    resources = ["*"]
  }
}

# cloudwatchポリシーの作成
data "aws_iam_policy_document" "cloudwatch" {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "arn:aws:logs:${local.region}:${local.id}:log-group:/aws/codebuild/${local.container_name}",
      "arn:aws:logs:${local.region}:${local.id}:log-group:/aws/codebuild/${local.container_name}:*"
    ]
  }
}

# S3ポリシーの作成
data "aws_iam_policy_document" "s3" {
  statement {
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:GetBucketAcl",
      "s3:GetBucketLocation"
    ]
    resources = [
      aws_s3_bucket.backend.arn
    ]
  }
}

# codebuildポリシーの作成
data "aws_iam_policy_document" "codebuild" {
  statement {
    actions = [
      "codebuild:CreateReportGroup",
      "codebuild:CreateReport",
      "codebuild:UpdateReport",
      "codebuild:BatchPutTestCases",
      "codebuild:BatchPutCodeCoverages"
    ]
    resources = [
      aws_codebuild_project.main.arn
    ]
  }
}

# Secrets Managerのポリシーの作成
data "aws_iam_policy_document" "secrets_manager" {
  statement {
    actions = [
      "secretsmanager:GetSecretValue",
    ]
    resources = [
      "arn:aws:secretsmanager:${local.region}:${local.id}:secret:your-secret-name-*",
    ]
    effect = "Allow"
  }
}

# IAMロールの作成
resource "aws_iam_role" "codebuild" {
  name               = "CodeBuildBasePolicy-${local.container_name}"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy" "ecs" {
  role   = aws_iam_role.codebuild.name
  policy = data.aws_iam_policy_document.ecs.json
}

resource "aws_iam_role_policy" "cloudwatch" {
  role   = aws_iam_role.codebuild.name
  policy = data.aws_iam_policy_document.cloudwatch.json
}

resource "aws_iam_role_policy" "s3" {
  role   = aws_iam_role.codebuild.name
  policy = data.aws_iam_policy_document.s3.json
}

resource "aws_iam_role_policy" "codebuild" {
  role   = aws_iam_role.codebuild.name
  policy = data.aws_iam_policy_document.codebuild.json
}

resource "aws_iam_role_policy" "secrets_manager" {
  role   = aws_iam_role.codebuild.name
  policy = data.aws_iam_policy_document.secrets_manager.json
}

############################################
# iam_role(CodeDeploy)
############################################
resource "aws_iam_role" "codedeploy" {
  assume_role_policy = jsonencode(
    {
      Statement = [
        {
          Action = "sts:AssumeRole"
          Effect = "Allow"
          Principal = {
            Service = "codedeploy.amazonaws.com"
          }
          Sid = ""
        },
      ]
      Version = "2012-10-17"
    }
  )
  description           = "Allows CodeDeploy to read S3 objects, invoke Lambda functions, publish to SNS topics, and update ECS services on your behalf."
  force_detach_policies = false
  managed_policy_arns = [
    "arn:aws:iam::aws:policy/AWSCodeDeployRoleForECS",
  ]
  max_session_duration = 3600
  name                 = "CodeDeployRoleForECSBlueGreen"
  path                 = "/"
}


############################################
# IAM role(CodePipeline)
############################################
resource "aws_iam_policy" "codepipeline" {
  name        = "AWSCodePipelineServiceRole-${local.region}"
  description = "Policy used in trust relationship with CodePipeline"
  path        = "/service-role/"
  policy = jsonencode(
    {
      Statement = [
        {
          Action = [
            "iam:PassRole",
          ]
          Condition = {
            StringEqualsIfExists = {
              "iam:PassedToService" = [
                "cloudformation.amazonaws.com",
                "elasticbeanstalk.amazonaws.com",
                "ec2.amazonaws.com",
                "ecs-tasks.amazonaws.com",
              ]
            }
          }
          Effect   = "Allow"
          Resource = "*"
        },
        {
          Action = [
            "codecommit:CancelUploadArchive",
            "codecommit:GetBranch",
            "codecommit:GetCommit",
            "codecommit:GetRepository",
            "codecommit:GetUploadArchiveStatus",
            "codecommit:UploadArchive",
          ]
          Effect   = "Allow"
          Resource = "*"
        },
        {
          Action = [
            "codedeploy:CreateDeployment",
            "codedeploy:GetApplication",
            "codedeploy:GetApplicationRevision",
            "codedeploy:GetDeployment",
            "codedeploy:GetDeploymentConfig",
            "codedeploy:RegisterApplicationRevision",
          ]
          Effect   = "Allow"
          Resource = "*"
        },
        {
          Action = [
            "codestar-connections:UseConnection",
          ]
          Effect   = "Allow"
          Resource = "*"
        },
        {
          Action = [
            "elasticbeanstalk:*",
            "ec2:*",
            "elasticloadbalancing:*",
            "autoscaling:*",
            "cloudwatch:*",
            "s3:*",
            "sns:*",
            "cloudformation:*",
            "rds:*",
            "sqs:*",
            "ecs:*",
          ]
          Effect   = "Allow"
          Resource = "*"
        },
        {
          Action = [
            "lambda:InvokeFunction",
            "lambda:ListFunctions",
          ]
          Effect   = "Allow"
          Resource = "*"
        },
        {
          Action = [
            "opsworks:CreateDeployment",
            "opsworks:DescribeApps",
            "opsworks:DescribeCommands",
            "opsworks:DescribeDeployments",
            "opsworks:DescribeInstances",
            "opsworks:DescribeStacks",
            "opsworks:UpdateApp",
            "opsworks:UpdateStack",
          ]
          Effect   = "Allow"
          Resource = "*"
        },
        {
          Action = [
            "cloudformation:CreateStack",
            "cloudformation:DeleteStack",
            "cloudformation:DescribeStacks",
            "cloudformation:UpdateStack",
            "cloudformation:CreateChangeSet",
            "cloudformation:DeleteChangeSet",
            "cloudformation:DescribeChangeSet",
            "cloudformation:ExecuteChangeSet",
            "cloudformation:SetStackPolicy",
            "cloudformation:ValidateTemplate",
          ]
          Effect   = "Allow"
          Resource = "*"
        },
        {
          Action = [
            "codebuild:BatchGetBuilds",
            "codebuild:StartBuild",
            "codebuild:BatchGetBuildBatches",
            "codebuild:StartBuildBatch",
          ]
          Effect   = "Allow"
          Resource = "*"
        },
        {
          Action = [
            "devicefarm:ListProjects",
            "devicefarm:ListDevicePools",
            "devicefarm:GetRun",
            "devicefarm:GetUpload",
            "devicefarm:CreateUpload",
            "devicefarm:ScheduleRun",
          ]
          Effect   = "Allow"
          Resource = "*"
        },
        {
          Action = [
            "servicecatalog:ListProvisioningArtifacts",
            "servicecatalog:CreateProvisioningArtifact",
            "servicecatalog:DescribeProvisioningArtifact",
            "servicecatalog:DeleteProvisioningArtifact",
            "servicecatalog:UpdateProduct",
          ]
          Effect   = "Allow"
          Resource = "*"
        },
        {
          Action = [
            "cloudformation:ValidateTemplate",
          ]
          Effect   = "Allow"
          Resource = "*"
        },
        {
          Action = [
            "ecr:DescribeImages",
          ]
          Effect   = "Allow"
          Resource = "*"
        },
        {
          Action = [
            "states:DescribeExecution",
            "states:DescribeStateMachine",
            "states:StartExecution",
          ]
          Effect   = "Allow"
          Resource = "*"
        },
        {
          Action = [
            "appconfig:StartDeployment",
            "appconfig:StopDeployment",
            "appconfig:GetDeployment",
          ]
          Effect   = "Allow"
          Resource = "*"
        },
      ]
      Version = "2012-10-17"
    }
  )
}

resource "aws_iam_role" "codepipeline" {
  assume_role_policy = jsonencode(
    {
      Statement = [
        {
          Action = "sts:AssumeRole"
          Effect = "Allow"
          Principal = {
            Service = "codepipeline.amazonaws.com"
          }
        },
      ]
      Version = "2012-10-17"
    }
  )
  managed_policy_arns  = [aws_iam_policy.codepipeline.arn]
  max_session_duration = 3600
  name                 = "AWSCodePipelineServiceRole-${local.region}"
  path                 = "/service-role/"
}
