---
layout: post
title: "Misja Gynvaela 008 [PL]"
date: 2017-07-16 17:30:00 +0200
categories: post
img: /data/posts/gynvael/misja_008_0.png
description: >
    Krótki writeup misji Gynvaela numer 008.
---
<a title="Misja Gynvaela 008." href="/data/posts/gynvael/misja_008_0.png">
    ![Misja Gynvaela 008.](/data/posts/gynvael/misja_008_0.png)
</a>

<p>
    Na streamie numer #45,
    <a title="Gynvael's Livestream #45" href="https://www.youtube.com/watch?v=3hGK87NTXmw">Gynvael</a>
    zamieścił kolejną ciekawą misję. Oto jej treść:
</p>

{% highlight bash %}
MISJA 008            goo.gl/gg4QcA                  DIFFICULTY: █████████░ [9/10]
┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅

Otrzymaliśmy dość nietypową prośbę o pomoc od lokalnego Instytutu Archeologii.
Okazało się, iż podczas prac remontowych studni w pobliskim zamku odkryto
niewielki tunel. Poproszono nas abyśmy skorzystali z naszego autonomicznego
drona wyposażonego w LIDAR (laserowy skaner odległości zamontowany na obracającej
się platformie) do stworzenia mapy tunelu.

Przed chwilą dotarliśmy na miejsce i opuściliśmy drona do studni. Interfejs I/O
drona znajduje się pod poniższym adresem:

  http://gynvael.coldwind.pl/misja008_drone_output/

Powodzenia!

--

Korzystając z powyższych danych stwórz mapę tunelu (i, jak zwykle, znajdź tajne
hasło). Wszelkie dołączone do odpowiedzi animacje są bardzo mile widziane.

Odzyskaną wiadomość (oraz mapę) umieśc w komentarzu pod tym video :)
Linki do kodu/wpisów na blogu/etc z opisem rozwiązania są również mile widziane!

HINT 1: Serwer może wolno odpowiadać a grota jest dość duża. Zachęcam więc do
cacheowania danych na dysku (adresy skanów są stałe dla danej pozycji i nigdy
nie ulegają zmianie).

HINT 2: Hasło będzie można odczytać z mapy po odnalezieniu i zeskanowaniu
centralnej komnaty.

P.S. Rozwiązanie zadania przedstawie na początku kolejnego livestreama.
{% endhighlight %}

<p>
    Do tego otrzymaliśmy API deklarujące format danych pobieranych z serwera:
</p>

{% highlight bash %}
SCAN DRONE v0.17.3
CLASSIFIED DATA. FOR YOUR EYES ONLY.

-- Podręcznik Operatora
 1. Dron posiada zamontowany obrotowy LIDAR.
 2. Dron automatycznie wykonuje skan LIDARem w każdym nowym miejscu.
 3. Skan odbywa się co 10 stopni i zwraca odległość w metrach.
 4. Zerowy stopien oznacza kierunek północny.
 5. Odległość może być niedokładna, szczególnie w okolicy ciasnych przejść.
 6. Zasięg LIDARu to 50m. Powyżej tej odległości zwracany jest "inf".
 7. Skan zawsze odbywa sie na wysokosci 1m nad powierzchnia.
 8. Dron zawsze porusza się o dokładnie jeden metr.
 9. Dron podaje swoją pozycję w metrach na osi zachód-wschód oraz
    północ-południe od ustawionego przez operatora (na stałe) nadajnika.
10. Dron może się poruszać jedynie w kierunkach wschód/zachód/północ/południe.

-- Format Danych
SCAN DRONE v0.17.3
POZYCJA_DRONA_X POZYCJA_DRONA_Y
ODLEGLOSC_NA_KĄCIE_0
ODLEGLOSC_NA_KĄCIE_10
ODLEGLOSC_NA_KĄCIE_20
...
ODLEGLOSC_NA_KĄCIE_350
MOVE_EAST: ADRES_PRZESUWAJĄCY_NA_WSCHÓD_LUB_"not possible"
MOVE_WEST: ADRES_PRZESUWAJĄCY_NA_ZACHÓD_LUB_"not possible"
MOVE_SOUTH: ADRES_PRZESUWAJĄCY_NA_POŁUDNIE_LUB_"not possible"
MOVE_NORTH: ADRES_PRZESUWAJĄCY_NA_PÓŁNOC_LUB_"not possible"
{% endhighlight %}

<p>
    Mamy już dużo informacji. Pora je wykorzystać. Chciałbym uprzedzić że pokazany kod
    pisany był na kolanie.
</p>

<div class="info">
    Zaczynamy!
</div>

<div class="sub info">
    Pamięć podręczna i parser
</div>

<p>
    Zgodnie z zaleceniami powinniśmy cache'ować wszystkie dane jakie otrzymamy z serwera.
    W tym celu napisałem sobie prostą klasę pozwalającą zapisać i odczytać dane z pliku:
</p>

{% highlight python %}
class Cache():
    def get(self, key):
        """ Get cached location """
        if key in [f for f in os.listdir("data/")]:
            file = open("data/" + key, "r")
            data = file.read()
            file.close()
            return data
        else:
            return None

    def store(self, key, content):
        """ Store location in cache """
        file = open("data/" + key, "w")
        file.write(content)
        file.close()
{% endhighlight %}

<p>
    Kolejnym krokiem będzie pobranie oraz parsowanie danych z serwera.
    Zaczniemy jednak od parsera:
</p>

{% highlight python %}
class Parser():
    def __init__(self, content):
        content = content.split('\n')
        self.posX = [int(s) for s in content[1].split() if s.isdigit()][0]
        self.posY = [int(s) for s in content[1].split() if s.isdigit()][1]

        self.data = []

        for idx in range(2, 38):
            if isinstance(content[idx], str) and content[idx] == "inf":
                content[idx] = "70.0000"
            self.data += re.findall(r"[-+]?\d*\.\d+|\d+", content[idx])

        self.destination = []

        self.destination += [content[38].split(' ')[1]] # East
        self.destination += [content[40].split(' ')[1]] # South
        self.destination += [content[39].split(' ')[1]] # West
        self.destination += [content[41].split(' ')[1]] # North
{% endhighlight %}

<div class="sub info">
    Pobieranie i obsługa danych
</div>

<p>
    Gdy możemy już przetwarzać dane z serwera na wygodniejszy dla nas format,
    musimy jakoś pobierać je z serwera z wykorzystaniem naszego cache'a:
</p>

{% highlight python %}
class Location():
    def __init__(self):
        self.last = None

    def get(self, key):
        """ Get location data from cache or webserver """
        if key == "not":
            return None

        requested_data = CACHE.get(key)

        if requested_data is None:
            while True:
                try:
                    r = requests.get("http://gynvael.coldwind.pl/misja008_drone_io/scans/" + key)
                    break
                except Exception as e:
                    print("Network error:", e)

            if r.status_code != 200:
                print("Error connecting to the server:", r.status_code)
                return None

            CACHE.store(key, r.content.decode("utf-8"))
            self.last = Parser(r.content.decode("utf-8"))
            return self.last
        else:
            self.last = Parser(requested_data)
            return self.last
{% endhighlight %}

<p>
    Ładnie - mamy dostęp do danych z drona. Postarajmy się więc
    przetworzyć odczyty z lidaru na pixele znajdujące się na mapie:
</p>

{% highlight python %}
class Location():
    ...
    def get_rays_pixels(self):
        """ Process LIDAR data to pixels """
        pixels = []
        for idx, value in enumerate(self.last.data):
            if value != 0 and float(value) < 64:
                a = (idx * 10) * math.pi / 180
                pX = self.last.posX + math.sin(a) * float(value)
                pY = self.last.posY - math.cos(a) * float(value)

                pixels += [(int(pX), int(pY))]
        return pixels
{% endhighlight %}

<div class="sub info">
    Rysowanie danych do obrazka
</div>

<p>
    Wszystko fajnie, ale nie mamy jak podejrzeć naszych odczytów.
    Musimy zapisywać je do pliku, najlepiej kilka razy
    podczas pracy programu żeby móc zrobić z wygenerowanych obrazów,
    ładną animację:
</p>

{% highlight python %}
class Renderer():
    def __init__(self):
        self.width = 1200
        self.height = 1000
        self.center = 50
        self.color_inc = 1
        self.timestamp = time.strftime("%Y%m%d-%H%M%S")
        self.location_image = Image.new('RGB', (self.width, self.height))
        self.counter = 0

    def save(self):
        """ Save to file """
        self.location_image.save('img/' + self.timestamp + '_location_' + str(self.counter) + '.png')
        self.counter += 1

    def render_location(self):
        """ Put pixels generated by LIDAR to image """
        for idx in LOCATION.get_rays_pixels():
            pix = self.location_image.getpixel((
                idx[0] + self.center, idx[1] + self.center
            ))
            self.location_image.putpixel(
                (idx[0] + self.center, idx[1] + self.center),
                (pix[0], pix[1] + self.color_inc, pix[2] + self.color_inc)
            )
{% endhighlight %}

<div class="sub info">
    Poruszanie się po mapie
</div>

<a title="Misja Gynvaela 008 - poruszanie się dronem." href="/data/posts/gynvael/misja_008_1.png">
    ![Misja Gynvaela 008 - poruszanie się dronem.](/data/posts/gynvael/misja_008_1.png)
</a>

<p>
    Ostatnim krokiem będzie stworzenie kawałka kodu który będzie zwiedzał mapę naszym
    dronem. Nie będziemy przelatywać każdego pola na mapie. Obecny program jest dość
    wolny, więc zajęło by to wieki. Ale na szczęście nie musimy tego robić.
    Wystarczy żę będziemy trzymać się ściany. Odczyty powinny ukazać resztę elementów.
</p>

<p>
    Do poruszania się po mapie użyjemy lekko zmodyfikowanego algorytmu Wall forever.
    Modyfikacja polega na tym że co 10 zmian pozycji będziemy odbijać dronem w kierunku
    prostopadłym do ściany za którą podążamy do momentu gdy napotkamy na przeszkodę. Potem wracamy do
    dalszego podążania za ścianą. Przedstawia to powyższy obrazek poglądowy.
    Czerwona i niebieska linia to droga jaką przebył dron. Czerwona podąża za ścianą,
    a niebieskie to cykliczne odbicia od czerwonej co 10 zmian czerwonej pozycji drona.
    Poniżej znajduje się część omawianego kodu. Całość można zobaczyć pod linkiem niżej.
</p>

{% highlight python %}
class Finder():
    def __init__(self, key, swap_finding=False, direction=0):
        ...
    ...

    def search(self):
        self.LOOP_COUNTER += 1

        ...

        if self.LOOP_COUNTER % 10 == 0:
            self.simple_ray()

        if self.follow_wall and self.angular == 0:
            self.follow_wall = False

        if not self.follow_wall:
            if not self.move(self.direction):
                self.follow_wall = True
                if self.swap_finding:
                    self.turn_right()
                else:
                    self.turn_left()
        else:
            if self.swap_finding:
                left = self.next_left()
            else:
                left = self.next_right()
            if self.move(left):
                if self.swap_finding:
                    self.turn_left()
                else:
                    self.turn_right()
            else:
                loop = 0
                while loop != 3:
                    if not self.move(self.direction):
                        if self.swap_finding:
                            self.turn_right()
                        else:
                            self.turn_left()
                    else:
                        break
                    loop += 1

        return None
{% endhighlight %}

<div class="sub info">
    Czas połączyć wszystko w całość
</div>

<p>
    Część z was pewnie się zastanawia skąd znalazły się tutaj te adresy.
    Otóż podczas wykonywania programu zauważyłem że algorytm nie jest w
    stanie odnaleźć wszystkich ścian, więc znalazłem dwa adresy innych miejsc
    na mapcę i wypuściłem tam po dwa "drony", każdy leciał w innym kierunku.
    Dzięki temu udało mi się odkryć całą mapę:
</p>

{% highlight python %}
def main():

    # Top Left
    finder_1 = Finder("955ab37b312b7191c7797d55edb914a5.txt", False, 0)
    finder_2 = Finder("955ab37b312b7191c7797d55edb914a5.txt", True, 0)
    # Drone Room
    finder_3 = Finder("e1ab3075efbc0182fdedd3036a00285d.txt", False, 1)
    finder_4 = Finder("e1ab3075efbc0182fdedd3036a00285d.txt", True, 1)

    try:
        while True:
            if finder_1.search() or finder_2.search() or finder_3.search() or finder_4.search():
                break
            if finder_1.LOOP_COUNTER % 50 == 0:
                RENDERER.save()
    except Exception as e:
        print("Something went wrong :/\n", e)

    RENDERER.save()
{% endhighlight %}

<p>
    Jako że po drodze zapisywałem postępy działania programu, udało mi się
    wygenerować całkiem fajną animację:
</p>

<div class="video">
    <iframe width="853" height="480" src="https://www.youtube.com/embed/xf_be-tOZ6g" frameborder="0" allowfullscreen></iframe>
</div>

<p>
    I tak dostaliśmy naszą flagę:<br><br><i>
    SECRET:<br>DRON3$C4N
    </i>
</p>

<a title="Kod źródłowy @ github" href="https://gist.github.com/pajadam/c172b8b377da9b696549763cc635cf8d"
   class="link icon-github"> Kod źródłowy</a>