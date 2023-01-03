// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Formula1/api/drivers');
    //self.baseUri = ko.observable('http://localhost:62595/api/drivers');
    self.displayName = 'Drivers List';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.records = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(50);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.search = function() { // mudar isto !!!!!!!!!!!!!
        console.log("searching")
        if ($("#searchbar").val() === "") {
            showLoading();
            var pg = getUrlParameter('page');
            console.log(pg);
            if (pg == undefined)
                self.activate(1);
            else {
                self.activate(pg);
            }
        } else {
            var changeUrl = 'http://192.168.160.58/Formula1/api/Search/Drivers?q=' + $("#searchbar").val();
            self.driverslist = [];
        ajaxHelper(changeUrl, 'GET').done(function(data) {
            console.log(data.length)
            if (data.length == 0) {
                return alert('No results found')
            }
            self.totalPages(1)
            console.log(data);
            showLoading();
            self.records(data);
            self.totalRecords(data.length);
            hideLoading();
            for (var i in data) {
                self.driverslist.push(data[i]);
                }
            });
        };
    };
    self.favoriteDriver = function (id, event) {
        console.log('favourite click!')
        if (JSON.parse(window.localStorage.getItem('favDrivers0')) == null) {
            console.log('no favDrivers in local storage, lets create it');
            window.localStorage.setItem('favDrivers0', '[]');
            var a = JSON.parse(window.localStorage.getItem('favDrivers0'));
            b = a.concat([id]);
            window.localStorage.setItem('favDrivers0', JSON.stringify(b));
        } else {
            var c = JSON.parse(window.localStorage.getItem('favDrivers0'))
            for (var i = 0; i < c.length; i++) {
                if (id == c[i]) {
                    return false
                }
            }
            var a = JSON.parse(window.localStorage.getItem('favDrivers0'));
            b = a.concat([id]);
            window.localStorage.setItem('favDrivers0', JSON.stringify(b));
            console.log('driver not favourited, added to favourites')
        }
        console.log(JSON.parse(window.localStorage.getItem('favDrivers0')))
    }
    self.onEnter = function(d,e) {
        e.keyCode === 13 && self.search();
        return true;
    };
    self.previousPage = ko.computed(function () {
        return self.currentPage() * 1 - 1;
    }, self);
    self.nextPage = ko.computed(function () {
        return self.currentPage() * 1 + 1;
    }, self);
    self.fromRecord = ko.computed(function () {
        return self.previousPage() * self.pagesize() + 1;
    }, self);
    self.toRecord = ko.computed(function () {
        return Math.min(self.currentPage() * self.pagesize(), self.totalRecords());
    }, self);
    self.totalPages = ko.observable(0);
    self.pageArray = function () {
        var list = [];
        var size = Math.min(self.totalPages(), 9);
        var step;
        if (size < 9 || self.currentPage() === 1)
            step = 0;
        else if (self.currentPage() >= self.totalPages() - 4)
            step = self.totalPages() - 9;
        else
            step = Math.max(self.currentPage() - 5, 0);

        for (var i = 1; i <= size; i++)
            list.push(i + step);
        return list;
    };
    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getDrivers...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.records(data.List);
            console.log("Records: ", self.records())
            self.currentPage(data.CurrentPage);
            self.hasNext(data.HasNext);
            self.hasPrevious(data.HasPrevious);
            self.pagesize(data.PageSize)
            self.totalPages(data.PageCount);
            self.totalRecords(data.Total);
            //self.SetFavourites();
        });
    };
    //--- Internal functions
    function ajaxHelper(uri, method, data) {
        self.error(''); // Clear error message
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            }
        });
    }

    function sleep(milliseconds) {
        const start = Date.now();
        while (Date.now() - start < milliseconds);
    }



    function showLoading() {
        $("#myModal").modal('show', {
            backdrop: 'static',
            keyboard: false
        });
    }
    function hideLoading() {
        $('#myModal').on('shown.bs.modal', function (e) {
            $("#myModal").modal('hide');
        })
    }

    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
        console.log("sPageURL=", sPageURL);
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }

    };

    //--- start ....
    showLoading();
    var pg = getUrlParameter('page');
    console.log(pg);
    if (pg == undefined)
        self.activate(1);
    else {
        self.activate(pg);
    }
};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
    $("#searchbar").autocomplete({
        minLength: 3,
        autoFill: true,
        source: function (request, response) {
            $.ajax({
                type: 'GET',
                url: 'http://192.168.160.58/Formula1/api/Search/Drivers?q=' + $("#searchbar").val(),
                success: function (data) {
                    response($.map(data, function (item) {
                        return item.Name;
                    }));
                },
                error: function(result) {
                    alert(result.statusText);
                },
            });
        },
        select: function (e, ui) {
            $.ajax({
                type: 'GET',
                url: 'http://192.168.160.58/Formula1/api/Search/Drivers?q=' + ui.item.label,
                success: function (data) {
                    window.location = 'driverDetails.html?id=' + data[0].DriverId;
                }
            })
        },
        messages: {
            noResults: '',
            results: function() {}
        }
    });
});