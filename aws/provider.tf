/*
# terraformに関する情報の設定
terraform {
  required_version = ">=1.7.4"

  # terraformで使用するプロバイダーの設定
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~>5.39.0"
    }
  }
}


# プロファイルの設定
provider "aws" {
  region  = local.region
}

provider "aws" {
  alias   = "virginia"
  region  = "us-east-1"
}

# tfstateファイルをs3に配置する
terraform {
  backend "s3" {
    bucket  = local.tfstate_bucket_name
    region  = local.region
  }
}
*/