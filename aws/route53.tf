# ホストゾーン
data "aws_route53_zone" "main" {
  name = local.host_domain
}

# cloudfront用のAレコード
resource "aws_route53_record" "main" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "kakeibo.${local.host_domain}"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}