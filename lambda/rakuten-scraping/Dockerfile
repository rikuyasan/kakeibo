# オフィシャルイメージを使用
FROM public.ecr.aws/lambda/python:3.12

# Seleniumをインストールする。
RUN python3.12 -m pip install selenium -t .
# selenium-managerを使ってChromeとChromeDriverをダウンロードする。
RUN /var/task/selenium/webdriver/common/linux/selenium-manager --browser chrome --cache-path /var/task
# Chromeの依存関係をインストールする。
RUN dnf install -y atk cups-libs gtk3 libXcomposite alsa-lib \
        libXcursor libXdamage libXext libXi libXrandr libXScrnSaver \
        libXtst pango at-spi2-atk libXt xorg-x11-server-Xvfb \
        xorg-x11-xauth dbus-glib dbus-glib-devel nss mesa-libgbm \
        libgbm libxkbcommon libdrm

# ルートディレクトリに使用するファイルをコピー
COPY app.py requirements.txt ./
RUN python3.12 -m pip install -r requirements.txt -t .

# 実行時に呼び出されるデフォルトのハンドラ
CMD ["app.lambda_handler"]