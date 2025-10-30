# Kali Linux GUI container for Tornado.ai tooling
FROM kalilinux/kali-rolling

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=UTC

ARG KALI_USER=kali
ARG KALI_PASSWORD=kali

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        kali-desktop-xfce \
        xrdp \
        dbus-x11 \
        sudo \
        kali-tools-top10 \
        curl \
        git && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash "${KALI_USER}" && \
    echo "${KALI_USER}:${KALI_PASSWORD}" | chpasswd && \
    adduser "${KALI_USER}" sudo && \
    echo "${KALI_USER} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

RUN echo "startxfce4" > /etc/skel/.xsession && \
    cp /etc/skel/.xsession /home/${KALI_USER}/.xsession && \
    chown ${KALI_USER}:${KALI_USER} /home/${KALI_USER}/.xsession && \
    printf '#!/bin/sh\n\nif [ -r /etc/default/locale ]; then\n  . /etc/default/locale\n  export LANG LANGUAGE\nfi\nstartxfce4\n' > /etc/xrdp/startwm.sh && \
    chmod +x /etc/xrdp/startwm.sh

COPY docker/kali/start-kali.sh /usr/local/bin/start-kali.sh
RUN chmod +x /usr/local/bin/start-kali.sh

EXPOSE 3389

CMD ["/usr/local/bin/start-kali.sh"]
