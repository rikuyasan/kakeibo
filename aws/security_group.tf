############################################
# security group
############################################

# セキュリティグループ(public)
resource "aws_security_group" "public" {
  description = "only pubric"
  name        = "ecs-pubric-security"
  vpc_id      = aws_vpc.demo.id
}

# セキュリティグループ(private)
resource "aws_security_group" "private" {
  description = "only private"
  name        = "ecs-private-security"
  vpc_id      = aws_vpc.demo.id
}

# アウトバウンドルール
resource "aws_security_group_rule" "egress" {
  for_each          = { for k, v in local.security_groups : k => v }
  cidr_blocks       = ["0.0.0.0/0"]
  from_port         = 0
  protocol          = "-1"
  security_group_id = each.value
  to_port           = 0
  type              = "egress"
}

# プライベートからのインバウンドルール
resource "aws_security_group_rule" "private" {
  for_each                 = { for k, v in local.security_groups : k => v }
  from_port                = 80
  protocol                 = "tcp"
  security_group_id        = each.value
  source_security_group_id = aws_security_group.private.id
  to_port                  = 80
  type                     = "ingress"
}

# パブリックからのインバウンドルール
resource "aws_security_group_rule" "public" {
  for_each                 = { for k, v in local.security_groups : k => v }
  from_port                = 80
  protocol                 = "tcp"
  security_group_id        = each.value
  source_security_group_id = aws_security_group.public.id
  to_port                  = 80
  type                     = "ingress"
}

# cloudfrontを経由したアクセスのみを許可
resource "aws_security_group_rule" "cloudfront" {
  prefix_list_ids   = [data.aws_ec2_managed_prefix_list.cloudfront.id]
  from_port         = 443
  protocol          = "tcp"
  security_group_id = aws_security_group.public.id
  to_port           = 443
  type              = "ingress"
}

data "aws_ec2_managed_prefix_list" "cloudfront" {
  name = "com.amazonaws.global.cloudfront.origin-facing"
}

# # dbからの通信を許可
# resource "aws_security_group_rule" "db" {
#   from_port                = 3306
#   protocol                 = "tcp"
#   security_group_id        = "sg-086b3bffe65973914"
#   source_security_group_id = aws_security_group.private.id
#   to_port                  = 3306
#   type                     = "ingress"
# }