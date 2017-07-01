---
layout: post
title: "My small and powerful VPS server."
date: 2017-07-02 00:30:00 +0200
categories: post
img: /data/posts/vps/vps_0.png
description: >
    Lately I've managed to migrate my VPS to another one.
    Ideal excuse to write something about my server.
---
<a title="My small and powerful VPS server." href="/data/posts/vps/vps_0.png">
    ![My small and useful VPS server.](/data/posts/vps/vps_0.png)
</a>

<p>
    After 9 months it's time to setup new server for my personal use.
    I already know what do I need, so it'll be much easier to pick
    good software for certain jobs.
</p>

<div class="info">
    Server destiny
</div>

<p>
    First of all we need to host static websites, for me and my friend
    with tiny traffic. We need to handle SSL encryption on every site.
    It's not a big deal. In addition we need to serve some precompiled
    software attached to my Blog. Nothing complicated. Next thing we gonna need is
    Django webapp with some good database engine, maybe some caching
    in the future. Again there's no big traffic there, so caching is
    not needed. Later we need to get TeamSpeak 3 server up and running
    for me and my friends. We use it daily, so it's pretty important too.
    And last but not least - IRC client. Also it would be great to install
    better shell to make server configuration easier.
</p>

<div class="info">
    Hosting and OS
</div>

<p>
    Hosting service is one of the most important things. We need cheap,
    high-available service with quite good performance, as we want to pack
    relatively big amount of software here. My choice is Digital Ocean.
    They offer VPS'es with SSD drives and 1Gbps network connection,
    in few locations around the world. We also get free DNS, firewall and
    monitoring tools with user predefined alerts, cool huh? My OS of choice
    is Ubuntu 16.04 LTS. There's no special reason for this. I'm just very
    comfortable with this distro and it have systemd on board, which is useful.
    <br><br>
    If you want some good VPS server on Digital Ocean you can use my referral
    link. It will give you $10 to spent, so it's definitely worth it.
</p>

<a title="Digital Ocean referral" href="https://m.do.co/c/da61e98ced76"
   class="link icon-link-ext"> Digital Ocean</a>

<div class="info">
    Software
</div>

<p>
    Finally we can pick software that'll suit my needs.
    Starting from webserver - let's go with Nginx. Simple, lightweight,
    fast. Capable of using Let's Encrypt SSL, caching and handling Django
    apps when paired with WSGI server.
    <br>
    <a title="Nginx" href="https://nginx.org/"
       class="link icon-link-ext"> Nginx</a>
</p>

<p>
    For Django application we'll make a pair of Gunicorn WSGI server and
    PostgreSQL. Last time I've used uWSGI instead of Gunicorn, but using
    Gunicorn we can make things like reloading when source code changes
    easier. It also seems to be faster and more configurable than uWSGI.
    Regarding to PostgreSQL it's lightweight and it has some more advanced
    queries that Django can make use of.
    <br>
    <a title="Gunicorn" href="http://gunicorn.org/"
       class="link icon-link-ext"> Gunicorn</a>
    <a title="PostgreSQL" href="https://www.postgresql.org/"
       class="link icon-link-ext"> PostgreSQL</a>
</p>

<p>
    We need IRC client and better shell to go. Last time I tried Weechat
    and I absolutely fall in love with it. Easily configurable, lot of plugins
    and cool features - everything you need. For system shell I'll go with
    Oh My ZSH. We use ton of helpful functions, helpers, plugins and themes.
    Everyone that tried it in a past will know what I'm talking about.
    <br>
    <a title="Weechat" href="https://weechat.org/"
       class="link icon-link-ext"> Weechat</a>
    <a title="OhMyZ.SH" href="http://ohmyz.sh/"
        class="link icon-link-ext"> OhMyZSH</a>
</p>



<div class="info">
    Summary
</div>

<a title="A+ on ssllabs - pajadam" href="/data/posts/vps/vps_1.png">
    ![A+ on ssllabs - pajadam](/data/posts/vps/vps_1.png)
</a>

<p>
    After few hours of configuration my webserver achieves A+ mark on ssl tests at
    <a href="https://www.ssllabs.com/index.html" title="SSLLabs">ssllabs.com</a>.
    we're running fully operational Django app, TeamSpeak server and offer cool
    IRC client. So we achieved quite good functionality but what about system resources?
    We have a lot of free space to do crazy things. VPS memory usage is only 172MB/512MB.
    Also there's a little 512MB swapfile with swappiness set to 1 in case of fire. Also we've
    used up only ~3GB of SSD space. So there's 17GB of fast storage to spend on archiving
    funny memes...
</p>

{% highlight bash %}
$ free -mh
              total        used        free      shared  buff/cache   available
Mem:           488M        135M         30M         18M        322M        303M
Swap:          511M         34M        477M
{% endhighlight %}

{% highlight bash %}
$ uptime
 00:26:18 up 2 days, 20:38,  1 user,  load average: 0.00, 0.00, 0.00
{% endhighlight %}

{% highlight bash %}
$ df -h
Filesystem      Size  Used Avail Use% Mounted on
...
/dev/vda1        20G  2.9G   17G  15% /
...
{% endhighlight %}

<p>
    Hope you enjoyed my VPS tour. I plan some cool stuff around VPSes like
    ScreenCloud integration or git continuous delivery done easily, so stay tuned!
</p>