# cloudfront用のwafルール
resource "aws_wafv2_ip_set" "cloudfront" {
  provider           = aws.virginia
  name               = "restrict-ip-cloudfront"
  description        = "restrict-ip-cloudfront"
  scope              = "CLOUDFRONT"
  ip_address_version = "IPV4"
  addresses          = local.my_ip
}

# web_aclの作成
resource "aws_wafv2_web_acl" "cloudfront" {
  provider    = aws.virginia
  name        = "restrict-ip-cloudfront"
  description = "restrict-ip-cloudfront"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  rule {
    name     = "WAFIPsetRule_restriction"
    priority = 0

    action {
      block {}
    }

    statement {
      not_statement {
        statement {
          ip_set_reference_statement {
            arn = aws_wafv2_ip_set.cloudfront.arn
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "waf-ipset-rule"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "restrict-ip-cloudfront"
    sampled_requests_enabled   = true
  }
}