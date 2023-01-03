var raceViewModel = function () {
    console.log("Race details VM starting up..");
    var self = this;
    self.baseUrl = ko.observable("http://192.168.160.58/Formula1/api/Races/Race?id=");
    self.DisplayName = 'Race Details';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.circuitName = ko.observable('');
    self.Year = ko.observable(''); // questionável a utilidade, visto que existe um parametro de data
    self.eventName = ko.observable(''); // Ex.: Portuguese Grand Prix, Austrian Grand Prix etc..
    self.Date = ko.observable('');
    self.DayMonthYear = ko.observable('');
    self.Time = ko.observable(''); // hora de começo
    self.wikiUrl = ko.observable('');
    self.Standings = ko.observableArray('');
    self.Round = ko.observable('');
    self.DNF = 'DNF'; // terminou, colidiu, deu spin off, acidente, etc..
    self.WinnerName = ko.observable('');
    self.WinnerImg = ko.observable('');

    self.months = ko.observableArray([{
        '01' : 'JAN',
        '02' : 'FEB',
        '03' : 'MAR',
        '04' : 'APR',
        '05' : 'MAY',
        '06' : 'JUNE',
        '07' : 'JULY',
        '08' : 'AUG',
        '09' : 'SEPT',
        '10': 'OCT',
        '11': 'NOV',
        '12': 'DEC'
    }])


    self.activate = function (id) {
        console.log("Getting race Id");
        var fullUrl = self.baseUrl() + id;
        ajaxHelper(fullUrl, 'GET').done(function (data) {
            console.log(data);
            self.circuitName(data.Circuit);
            self.Round(data.Round);
            self.Year(data.Year);
            self.eventName(data.Name);
            self.wikiUrl(data.Url);
            self.Date(data.Date.split('T'));
            self.DayMonthYear(self.Date()[0].split('-'))
            console.log(self.months())
            console.log(self.months()[0][self.DayMonthYear()[1]])
            console.log(self.DayMonthYear()[1])
            console.log(self.months()[08])
            self.Time(data.Time);
            self.Standings(data.Results);
            self.WinnerName(data.Results[0].DriverName);
            console.log(self.WinnerName())
            $.ajax({
                url: 'http://192.168.160.58/Formula1/api/Search/Drivers?q=' + self.WinnerName(),
                success: function (result) {
                    console.log("Made it into the 2nd call!! Results:");
                    console.log(result);
                    if (result[0].ImageUrl == null) {
                        self.WinnerImg("Images/default-pfp.png");
                    } else {
                        self.WinnerImg(result[0].ImageUrl);
                    }
                    console.log(self.WinnerImg())
                }
            });
        });
        console.log(self.Standings())
        var imgCall = 'http://192.168.160.58/Formula1/api/Search/Drivers?q='
        console.log(imgCall)
    }

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
    function showLoading() {
        $('#myModal').modal('show',{
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

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };
    
    // Start up
    showLoading()
    var pg = getUrlParameter('id');
    console.log(pg);
    if (pg == undefined) {
        self.activate(1);
    } else {
        self.activate(pg);
    }
};
$(document).ready(function () {
    console.log("Document Ready!");
    ko.applyBindings(new raceViewModel());
})