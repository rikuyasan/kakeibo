# ベースイメージとしてAmazon Linux 2を使用
FROM amazonlinux:2

# 必要に応じてopenssl-develを削除し、openssl11をインストール
RUN yum list installed | grep openssl-devel && yum remove -y openssl-devel || echo "openssl-devel is not installed"
RUN yum install -y openssl11 openssl11-devel

# 必要な開発ツールとライブラリをインストール
RUN yum install -y \
    gcc \
    make \
    zlib-devel \
    bzip2 \
    bzip2-devel \
    readline-devel \
    sqlite \
    sqlite-devel \
    tk-devel \
    libffi-devel \
    xz-devel \
    git \
    tar \
    zip 

# pyenvのインストールしパスを通す
RUN git clone https://github.com/yyuu/pyenv.git ~/.pyenv
RUN echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc && \
    echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc && \
    echo 'eval "$(pyenv init -)"' >> ~/.bashrc
# bashコマンドを起動して、python、pipのインストール
RUN bash -c "source ~/.bashrc && pyenv install 3.11.7 && pyenv global 3.11.7 && pip install --upgrade pip"