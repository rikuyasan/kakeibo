# 東京リージョンのacm証明書
resource "aws_acm_certificate" "main" {
  domain_name = local.host_domain
}

# cloudfront用のacm証明書
resource "aws_acm_certificate" "frontend" {
  provider          = aws.virginia
  domain_name       = "*.${local.host_domain}"
  validation_method = "DNS"
}
