# Dr-ganeev

![](https://img.shields.io/github/last-commit/denzakh/dr-ganeev.svg) 
![GitHub watchers](https://img.shields.io/github/watchers/denzakh/dr-ganeev?color=yellow&label=watch)
![](https://img.shields.io/badge/license-Apache%202-blue.svg) 
![W3C Validation](https://img.shields.io/w3c-validation/html?targetUrl=https%3A%2F%2Fdr-ganeev.ru%2F)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/denzakh/dr-ganeev?color=9cf)

Сайт доктора Ганеева. Сделан для изучения и обкатки современных технологий фронтенда, в том числе сборки и деплоя.

![](https://raw.githubusercontent.com/denzakh/dr-ganeev/master/docs/promo.jpg)

## Установка

Требуются установленный [git](http://git-scm.com/downloads) и [Node.js](https://nodejs.org/en/download/) (LTS).

Для установки нужно открыть терминал, открыть в нем папку проектов и клонировать туда этот репозиторий: 

```
git clone https://github.com/denzakh/dr-ganeev.git
```
Зайти в папку проекта `dr-ganeev` и удалить папку `.git`

Затем внутри проекта выполнить установку зависимостей:
```
npm i
```
Сделать первоначальный билд (для обработки картинок):
```
npm run build
```
И запустить режим разработки:
```
npm start
```
> Сервер разработки в сборке отсутствует. Предполагается, что он будет настроен самостоятельно с корнем в папке `dist`

## Структура

**.git** – служебная папка гита, хранит локальную копию репозитория.

**.github** – служебная папка гитхаба. Файл `.github/workflows/deploy.yml` содержит инструкции по деплою на сервер.

**docs** – файлы документации проекта. 

**src** – папка с исходниками. Здесь ведется разработка, хранятся HTML, исходники стилей в less, JS и несжатые картинки.

**dist** – папка с результатом. Сюда настроен корень веб-сервера на локалке. Содержимое этой папки деплоится на рабочий сервер.

**node_modules** – служебная папка с модулями ноды. Лежит вне гита. Создается на основе списка зависимостей в `package.json`.

**.gitignore** – список файлов и папок, которые не должны попасть в гит.

**gulpfile.js** – файл сценариев сборки

**package.json** – основной файл конфигурации, содержит список npm-зависимостей и скриптов запуска.

## Разработка

Основана на сценариях gulp (v4), описанных в `gulpfile.js`. Часть задач галпа экспортируются и могут быть запущены из консоли как через файл галпа 
`npm run gulp`, так и как сценарии npm `npm start` (описаны в package.json). Задачи:

**js** – сборка и минификация javascript cтранспиляцией в ES5.

**css** – сборка и минификация css из less, точка входа – файл `style.less`. 

**img** – сжатие картинок плагинами imagemin: mozjpeg, gifsicle, optipng, svgo.

**html** – копирует html c удалением пробелов.

**watch** – задача по умолчанию для gulp и npm, после запуска отслеживает изменения js, less и html в папке src, при изменении файлов запускает соответствующие задачи (сборка js и css, копирование html). Экспортируется как `default`, запуск из консоли `npm start`.

**build** – собирает стили, js, html и картинки. Экспортируется. Запуск `$ npm run build`.

**deploy** – заливает файлы на рабочий сервер. Экспортируется. В отличие от файла `deploy.yml` выполняющегося на github, эта задача предназначана для экстренной заливки на сервер с локального компьютера. Требует наличия в системе `rsync` (на Linux или из [WSL](https://youtu.be/HYuFw-YldjU)). 

## Деплой

Сделан на основе [видеурока Макеева](https://youtu.be/hevU4NdIsoU). Когда на гитхаб приходит новый коммит, вебхук активирует CI-систему `github-action`. Она смотрит в файл `.github/workflows/deploy.yml` и выполняет инструкции:

1. устанавливает легкую Ubuntu
2. устанавливает Node
3. создает папку .ssh и кладет туда секретный ключ из хранилища гитхаба `secrets`
4. делает build 
5. заливает результат на сервер

> Для успешной заливки хостинг должен поддерживать ssh и не иметь ограничений по входящим ip.

## Создание своего проекта

1. Создать новый репозиторий на github, например `deploy-test`
2. Скопировать инструкции со следующей страницы, из раздела 
`…or create a new repository on the command line`
3. открыть в консоле папку (dr-ganeev) и выполнить в ней
```node
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/<ВАШ_ЛОГИН>/deploy-test.git
git push -u origin main
```
В результате в этой папке будет создан локальный репозиторий, связанный с репозиторием на гитхабе.

## Настройка деплоя для своего проекта

1. Настроить на своем хостинге [доступ по ключу ssh](https://firstvds.ru/technology/dobavit-ssh-klyuch).
2. Записать эти данные в конфигурацию:  
- В `gulpfile.js` задача `deploy` переменные `hostname` и `destination`. В destination должен быть записан абсолютный путь от корня.  
- В `deploy.yml` раздел `Deploy`.
- Добавить все в индекс и закоммитить
```node
git add .
git commit -m "deploy"
```
3. В настройках репозитория на гитхабе нужно добавить новый ключ:  
settings -> secrets -> new repository secret  
name `KEY`, value – ваш приватный ключ ssh от хостинга

Если все правильно настроить, то по команде 
```node
git push origin main
```
должна запуститься сборка на гитхабе, а результат быть залит на ваш хостинг
<blockquote class="dg-alert"> <b>Внимание</b>: rsync перетирает указанный каталог, на что указывает флаг <b>--delete</b>. При неправильном указании пути он может перетереть все файлы на хостинге!
</blockquote>

<style>
.dg-alert {
    border-left-color: darkred; 
    color: darkred;
}
</style>   