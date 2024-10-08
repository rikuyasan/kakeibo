############################################
# application load balancer
############################################
# アプリケーションロードバランサの作成
resource "aws_lb" "main" {
  load_balancer_type = "application"
  name               = "blue-green-alb"
  security_groups = [
    aws_security_group.public.id,
  ]
  subnets = values(aws_subnet.public)[*].id
}

# ターゲットグループの設定(blue)
resource "aws_lb_target_group" "blue" {
  name        = "ecs-blue"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.demo.id

  health_check {
    enabled             = true
    healthy_threshold   = 5
    matcher             = "200"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
}

# ターゲットグループの設定(green)
resource "aws_lb_target_group" "green" {
  name        = "ecs-green"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.demo.id

  health_check {
    enabled             = true
    healthy_threshold   = 5
    matcher             = "200"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
}

# リスナーの設定
resource "aws_lb_listener" "main" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08" # 要確認
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    target_group_arn = aws_lb_target_group.blue.arn
    type             = "forward"
  }
  lifecycle {
    ignore_changes = [
      default_action[0].target_group_arn
    ]
  }
}