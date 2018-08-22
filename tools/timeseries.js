
function interpretTimeDiv(text){
    switch(text){
        case "1 minute":
            return 60000;
            break;
        case "15 minutes":
            return 900000;
            break;
        case "30 minutes":
            return 1800000;
            break;
        case "1 hour":
            return 3600000;
            break;
        case "1 day":
            return 86400000;
            break;
        case "1 week":
            return 604800000;
            break;
    }
}

module.exports = {
    generateTimeSeries: function(time_div,input_tweets,metric){
        var unix_time_div = interpretTimeDiv(time_div);

        var array_times = new Array;
        var array_values = new Array;
        var array_tweet_bins = new Array;
        var indices = {};

        var time_series = {division: time_div, counts: [], times: []};

        var last_tweet_time = new Date(input_tweets[0].raw.created_at);
        var first_tweet_time = new Date(input_tweets[0].raw.created_at);
        for(var i=0; i<input_tweets.length;i++){
            var time_i = new Date(input_tweets[i].raw.created_at);
            if(time_i.getTime() > last_tweet_time.getTime()){
                last_tweet_time = time_i;
            }else if(time_i.getTime() < first_tweet_time.getTime()){
                first_tweet_time = time_i;
            }
        }    
        var range_max = new Date();
        var range_min = new Date();
        range_max.setTime(last_tweet_time.getTime());
        range_min.setTime(first_tweet_time.getTime());
        range_max.setUTCSeconds(0);
        range_min.setUTCSeconds(0);
        if(time_div=="1 hour"||time_div=="1 day"){
            range_max.setUTCMinutes(0);
            range_min.setUTCMinutes(0);
        }
        if(time_div=="1 day"){
            range_max.setUTCHours(0);
            range_min.setUTCHours(0);
        }
        // console.log(range_max.toUTCString());
        // console.log(range_min.toUTCString());
        var time_i = range_min;
        var i = 0;
        while(time_i.getTime() <= range_max.getTime()){
            // console.log(time_i.getTime());
            // console.log(time_i.toString());
            var t = new Date(time_i);
            array_times.push(t);
            array_values.push(0);
            array_tweet_bins.push([]);
            indices[t] = i;
            time_i.setTime(time_i.getTime() + unix_time_div);
            i++;
        }
        for(var i=0; i<input_tweets.length; i++){
            var t = new Date(input_tweets[i].raw.created_at);
            t.setSeconds(0);
            if(time_div=="1 hour"||time_div=="1 day"){
                t.setUTCMinutes(0);
            }
            if(time_div=="1 day"){
                t.setUTCHours(0);
            }
            array_tweet_bins[indices[t]].push(input_tweets[i]);
        }
        for(var i=0; i<array_tweet_bins.length; i++){
            array_values[i] = metric(array_tweet_bins[i]);
        }
        time_series.values = array_values;
        time_series.times = array_times;
        // console.log(array_values);
        // console.log(array_times);
        // console.log(indices);
        // console.log(time_series);
        return time_series;
    },
    plot: function(id,time_series){
    var data = [{
        x: time_series.times,
        y: time_series.values,
        fill: 'none',
        type: 'bar'
    }];
    plotly.plot(id,data);
    }
};
