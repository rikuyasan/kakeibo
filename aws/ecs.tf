# ecsクラスターの作成
resource "aws_ecs_cluster" "main" {
  name = local.container_name
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# タスク定義の作成
resource "aws_ecs_task_definition" "main" {
  container_definitions = jsonencode(
    [
      {
        cpu       = 0
        essential = true
        image     = local.ecr_arn

        logConfiguration = {
          logDriver = "awslogs"
          options = {
            awslogs-create-group  = "true"
            awslogs-group         = "/ecs/${local.container_name}"
            awslogs-region        = local.region
            awslogs-stream-prefix = "ecs"
          }
        }
        name = local.container_name
        portMappings = [
          {
            appProtocol   = "http"
            containerPort = local.to_port
            hostPort      = local.from_port
            name          = "${local.container_name}-${local.to_port}-tcp"
            protocol      = "tcp"
          },
        ]
      },
    ]
  )
  cpu                      = local.cpu
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  family                   = local.container_name
  memory                   = local.memory
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  task_role_arn            = aws_iam_role.ecs_execution.arn
  track_latest             = false

  runtime_platform {
    cpu_architecture        = "X86_64"
    operating_system_family = "LINUX"
  }
}

# タスク起動用のIAMロール
resource "aws_iam_role" "ecs_execution" {
  assume_role_policy = jsonencode(
    {
      Statement = [
        {
          Action = "sts:AssumeRole"
          Effect = "Allow"
          Principal = {
            Service = "ecs-tasks.amazonaws.com"
          }
          Sid = ""
        },
      ]
      Version = "2008-10-17"
    }
  )
  managed_policy_arns = [
    local.cloudwatch_policy,
    local.ecsservice_policy,
  ]
  max_session_duration = 3600
  name                 = "ecsTaskExecutionRole"
  path                 = "/"
}

# ecsサービスの作成
resource "aws_ecs_service" "main" {
  cluster                 = aws_ecs_cluster.main.id
  desired_count           = local.min_capacity
  enable_ecs_managed_tags = true
  launch_type             = "FARGATE"
  name                    = local.container_name
  platform_version        = local.platform_version
  propagate_tags          = "NONE"
  task_definition         = data.aws_ecs_task_definition.main.arn

  deployment_controller {
    type = "CODE_DEPLOY"
  }

  load_balancer {
    container_name   = local.container_name
    container_port   = local.to_port
    target_group_arn = aws_lb_target_group.green.arn
  }

  network_configuration {
    assign_public_ip = false
    security_groups  = [aws_security_group.private.id]
    subnets          = values(aws_subnet.private)[*].id
  }

  lifecycle {
    ignore_changes = [task_definition, load_balancer]
  }
}

data "aws_ecs_task_definition" "main" {
  task_definition = aws_ecs_task_definition.main.family
}