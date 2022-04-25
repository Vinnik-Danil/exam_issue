$(document).ready(function () {
    const API_HOST = 'http://localhost:8010/proxy';
    let allUsers = [];

    getAllOrOneUsers().then(res => {
        generateTable( '.user-list-wrapper', res)
    })

    async function deleteUsers (userId){
        $('.loader').css("display", "block");
        return await fetch(`${API_HOST}/delete_user/${userId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            referrerPolicy: 'no-referrer',
        })
            .then(res => res.json())
            .then(res => {
                $('.loader').css("display", "none");
                return res;
            })
            .catch(err => {
                console.error(err);
                return null;
            });
    }

    async function getAllOrOneUsers (userId){
        $('.loader').css("display", "block");
        let endPointUrl = userId ? `${API_HOST}/${userId}` : `${API_HOST}/show_users/`;
        return await fetch(endPointUrl, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then(res => res.json())
            .then(res => {
                allUsers = res;
                $('.loader').css("display", "none");
                return res;
            })
            .catch(err => {
                console.error(err);
                return null;
            });
    }

    async function createUpdateUser (typeFN,userName, email, password, userId) {
        var d = new Date();
        let date = d.getFullYear()+'-'+(d.getMonth())+'-'+d.getDate();
        let endPointUrl = !userId ? `${API_HOST}/create_user/` : `${API_HOST}/update_user/${userId}/`;
        $('.loader').css("display", "block");
        const requestBody = {
            user_name: userName,
            email: email,
            password: password,
            status: "active",
            created_at: date,
            updated_at: date
        };

        return await fetch(endPointUrl, {
            method: typeFN,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(requestBody),
        })
            .then(response => response.json())
            .then(data => {
                $('.loader').css("display", "none");
                return data;
            })
            .catch((error) => {
                console.error(error);
            });
    };

    function generateTable(appendTo, response){
        var $table = $('<table>');
        $table.append('<thead>').children('thead')
            .append('<tr />').children('tr').append('<th>Id</th><th>Name</th><th>Email</th><th>Password</th><th>Status</th><th>Action</th>');

        var $tbody = $table.append('<tbody />').children('tbody');
        response.forEach(elem => {
            $tbody.append('<tr />').children('tr:last')
                .append("<td>"+elem.id+"</td>")
                .append("<td>"+elem.user_name+"</td>")
                .append("<td>"+elem.email+"</td>")
                .append("<td>"+elem.password+"</td>")
                .append("<td>"+elem.status+"</td>")
                .append(generateDropDownMenu(elem.id));
        })
        $table.appendTo(appendTo);
    }

    function generateDropDownMenu(id) {
        return '<ul class="drop-down"><li><a>Action</a><ul><li><a class="update" id='+id+'>Update</a></li><li><a class="delete" id='+id+'>Delete</a></li></ul></li></ul>'
    }

    function removeAllSelectedModule(){
        $(".side-navigation li a").each(function () {
            $(this).removeClass('active-link');
        })
        $("#menu li a").each(function () {
            $(this).removeClass('active-link');
        })
        $(".main-section").each(function () {
            $(this).css("display", "none");
        })
    }

    function selectAllUserAfterRequest(){
        removeAllSelectedModule();
        $(".user-list-component").css("display", "block");
        $('#allUser').addClass('active-link');
        refreshTable();
    }

    function refreshTable(){
        $(".user-list-component").css("display", "block");
        if (!$('.user-list-wrapper').children('table').get(0)){
            getAllOrOneUsers().then(res => {
                generateTable( '.user-list-wrapper', res)
            })
        } else {
            $('.user-list-wrapper').children('table').get(0).remove()
            getAllOrOneUsers().then(res => {
                generateTable( '.user-list-wrapper', res)
            })
        }
    }

    function validateEmail(email)
    {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    $('#createUserSubmit').click(function (e){
        e.preventDefault();
        let sendData = {}
        $('#createUserWrapper').children('input').each(function (){
            if ($(this).attr('type') !== 'submit'){
                sendData[$(this).attr("name")]=$(this).val()
            }
        })
        if(validateEmail(sendData.email)) {
            $("input[name='mail']").css("border", "2px solid red")
            createUpdateUser('POST',sendData.userName, sendData.email, sendData.password).then(res => {
                selectAllUserAfterRequest();
            })
        }
    })

    $('#updateUserSubmit').click(function (e){
        let sendData = {}
        $('#updateUserWrapper').children('input').each(function (){
            if ($(this).attr('type') !== 'submit'){
                sendData[$(this).attr("name")]=$(this).val()
            }
        })
        if(validateEmail(sendData.email)) {
            $("input[name='mail']").css("border", "2px solid red")

            createUpdateUser('PUT', sendData.userName, sendData.email, sendData.password, sendData.id).then(res => {
                selectAllUserAfterRequest();
            })
        }
    })

    $('.user-list-wrapper, .get-user-by-id-wrapper').on('click', '.delete', function(e) {
        deleteUsers(e.target.id).then(res => {
            refreshTable();
        })
    })

    $('.user-list-wrapper, .get-user-by-id-wrapper').on('click', '.update', function(e) {
        removeAllSelectedModule();
        $('#updateUser').addClass('active-link');
        $(".update-user-component").css("display", "block");
        $('#updateUserId').val(e.target.id);

    })

    $('#searchUserByIdSubmit').click(function (e) {
        e.preventDefault();
        if ($('.get-user-by-id-wrapper').children('table').get(0)){
            $('.get-user-by-id-wrapper').children('table').get(0).remove()
        }

        getAllOrOneUsers($("#searchInput").val()).then(res => {
            generateTable( '.get-user-by-id-wrapper', res)
        })

    })

    $(".side-navigation li a").click(function (e) {
        removeAllSelectedModule()
        $(this).addClass('active-link');
        switch (e.target.id) {
            case 'allUser' :
                $(".user-list-component").css("display", "block");
                refreshTable();
                break;
            case 'createUser' :
                $(".create-user-component").css("display", "block");
                break;
            case 'updateUser' :
                $(".update-user-component").css("display", "block");
                break;
            case 'getUser' :
                $(".get-user-component").css("display", "block");
                break;
        }
    })
    $("#menu li a").click(function (e) {
        removeAllSelectedModule()
        $(this).addClass('active-link');
        $('#menuToggle input').prop('checked', false)
        switch (e.target.id) {
            case 'allUserMobile' :
                $(".user-list-component").css("display", "block");
                refreshTable();
                break;
            case 'createUserMobile' :
                $(".create-user-component").css("display", "block");
                break;
            case 'updateUserMobile' :
                $(".update-user-component").css("display", "block");
                break;
            case 'getUserMobile' :
                $(".get-user-component").css("display", "block");
                break;
        }
    })

    $('.imgRotate').click(function (e) {
        if($('.imgRotate').css('transform') !== 'none') {
            $('.imgRotate').css("transform", "none");
            $('.about-us-title').css("margin-bottom", "15px");
            $('.textHidden').fadeIn(1000);
        } else {
            $('.imgRotate').removeAttr('style');
            $('.about-us-title').removeAttr('style');
            $('.textHidden').removeAttr('style');
        }
    })
});
