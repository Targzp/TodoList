window.addEventListener("load",()=>{
    let hour,minute;
    let i=0,j=0,n=1;
    let alltasks = new Array();

    //页面初始化从本地存储中提取任务
    function initialTasks(){
        if(localStorage.length > 0){
            alltasks = JSON.parse(localStorage.getItem('task'));
            let task_input = document.querySelector('#task');
            let Mevent = document.createEvent("HTMLEvents");
            Mevent.initEvent('submit',true,true,document.defaultView);
            for(let x=0,len=alltasks.length;x<len;x++){
                n = alltasks[x].title;
                task_input.value = alltasks[x].value;
                document.forms[0].dispatchEvent(Mevent);
            }
        }
    }

    //若任务中有完成的移动到结束栏
    function initialDoneTasks(){
        let Cevent = document.createEvent("MouseEvent");
        Cevent.initMouseEvent('click',true,true,document.defaultView);
        for(let x=0,len=alltasks.length;x<len;x++){
            if(alltasks[x].done == true){
                let done_task = document.getElementById(`task${alltasks[x].title}`);
                done_task.parentNode.getElementsByClassName('done')[0].dispatchEvent(Cevent);
            }
        }
    }

    //功能一：输入待办任务
    function enterDoing(event){
        //取消提交的默认行为
        event.preventDefault();    

        //每新加入一个任务，待办栏任务个数加一
        let todocount1 = document.querySelectorAll(".todocount")[0];
        todocount1.innerHTML = `${++i}`;

        //获取输入的任务并先存储到本地客户端
        let task_input = document.querySelector("#task");
        let task_text = document.createTextNode(task_input.value);
        let task = document.createElement("p");
        task.appendChild(task_text);
        task.id = `task${n}`;
        task.className = "task";

        //如果是页面初始化从本地存储导入的任务不用再添加进与本地存储相关连的数组
        if(!(alltasks.find((elem)=>elem.value==task_text.nodeValue))){
            alltasks.push({title: n,value:task_text.nodeValue,done:false})
            localStorage.setItem(`task`,JSON.stringify(alltasks));
        }
        n++;


        //生成任务卡片
        let p = document.createElement("p");
        p.className = "item";

        //任务加入时间提示
        let span = document.createElement("span");
        let time = new Date();
        hour = time.getHours()<10?'0'+time.getHours():time.getHours();
        minute = time.getMinutes()<10?'0'+time.getMinutes():time.getMinutes();
        span.innerHTML = `${hour}:${minute}`;
        span.time = `${hour}:${minute}`; /* 通过设置 time 属性记住开始时间 */
        span.className = "time";

        //生成任务勾选框
        let done = document.createElement("input");
        done.type = "checkbox";
        done.name = "done"; 
        done.className = "done";

        //生成取消按钮图片
        let cancel_img = document.createElement("img");
        cancel_img.src = "img/取消.png";
        cancel_img.className = "cancel_img";

        //生成优先级按钮图片
        let prior_img = document.createElement("img");
        prior_img.src = "img/优先级.png";
        prior_img.className = "prior_img";

        //生成优先级附栏
        let prior_list = document.createElement("ul");
        prior_list.innerHTML = `
            <li><a href="#" class="high">高优先级</a></li>
            <li><a href="#" class="middle">中优先级</a></li>
            <li><a href="#" class="low">低优先级</a></li>
            <li><a href="#" class="none">无优先级</a></li>
        `;
        prior_list.className = "prior_list";

        //前三个orphan节点先进入文档碎片，最后统一添加至 p 节点
        let documentFragment = new DocumentFragment();
        documentFragment.appendChild(span);
        documentFragment.appendChild(done);
        documentFragment.appendChild(task);
        documentFragment.appendChild(prior_img);
        documentFragment.appendChild(cancel_img);
        documentFragment.appendChild(prior_list);
        p.appendChild(documentFragment);

        //将待办栏初始化时使用的提示卡片隐藏
        let p_tips = document.querySelectorAll(".tips")[0];
        p_tips.style.display = "none";

        //将任务卡片和卡片优先级附栏添加到待办栏中
        let Todo = document.querySelector(".Todo");
        Todo.appendChild(p);

        //重置表单
        document.forms[0].reset();
    }

    document.forms[0].addEventListener("submit",enterDoing,false);


    //以下函数利用事件委托机制对文档中 click 事件进行统一处理
    function allClickEvents(event){
        
        //获取触发事件的实际目标以及与目标上下文相关的节点
        let target = event.target;
        let p = target.parentNode;
        let p_parent = p.parentNode;
        let p_tips1 = document.querySelectorAll(".tips")[0];
        let p_tips2 = document.querySelectorAll(".tips")[1];
        let Todo = document.querySelector(".Todo");
        let Done = document.querySelector(".Done");
        let todocount = document.querySelectorAll(".todocount");
        //创建新的 Date 对象
        let time = new Date();

        //如果目标节点为 a 节点，取消click事件的默认行为
        if(target.href){
            event.preventDefault();
        }
    
        //根据目标节点的类名判断哪个节点触发了事件，从而执行相应的行为
        switch(target.className){
            
            //点击任务勾选框，实现任务结束进入结束栏，从结束状态重回待办栏
            case "done":
                //如果任务卡片的父节点是类名为 ToDo 的节点，则可知任务结束进入结束栏
                if(p_parent === Todo){

                    //
                    let task = p.getElementsByClassName('task')[0];
                    let id_number = task.id.slice(4);
                    for(let x=0,len=alltasks.length;x<len;x++){
                        if(alltasks[x].title == id_number){
                            alltasks[x].done = true;
                        }
                    }
                    localStorage.setItem('task',JSON.stringify(alltasks));

                    //将任务优先级附栏保存至目标节点父节点的 nextUl 属性中
                    p.nextUl = p.lastElementChild;
                    p.removeChild(p.lastElementChild);
                    p.style.borderLeftColor = "transparent";
                    Todo.removeChild(p);

                    //每移走一个任务卡片，待办栏任务个数减一
                    todocount[0].innerHTML = `${--i}`;

                    //如果就剩下一个隐藏的说明卡片，那就显示这张说明卡片
                    if(Todo.childElementCount == 1){    
                        p_tips1.style.display = "";
                    }

                    //因任务卡片终结进入结束栏，所以结束栏的说明卡片隐藏
                    p_tips2.style.display = "none";
        
                    //获取上面保存的任务卡片的设定的开始时间
                    let startTime = p.firstElementChild.time;
                    hour = time.getHours()<10?'0'+time.getHours():time.getHours();
                    minute = time.getMinutes()<10?'0'+time.getMinutes():time.getMinutes();
                    p.firstElementChild.innerHTML = `${startTime}-${hour}:${minute}`;

                    //将这个结束任务进入结束栏
                    Done.appendChild(p);
                    
                    //每当结束任务进入结束栏，结束栏的任务个数就加一
                    todocount[1].innerHTML = `${++j}`;

                //如果任务卡片的父节点是类名为 Done 的节点，则可知结束栏的任务重回待办栏
                }else if(p_parent === Done){
                    let task = p.getElementsByClassName('task')[0];
                    let id_number = task.id.slice(4);
                    for(let x=0,len=alltasks.length;x<len;x++){
                        if(alltasks[x].title == id_number){
                            alltasks[x].done = false;
                        }
                    }
                    localStorage.setItem('task',JSON.stringify(alltasks));

                    Done.removeChild(p);

                    todocount[1].innerHTML = `${--j}`;

                    if(Done.childElementCount == 1){
                        p_tips2.style.display = "";
                    }

                    p_tips1.style.display = "none";

                    hour = time.getHours()<10?'0'+time.getHours():time.getHours();
                    minute = time.getMinutes()<10?'0'+time.getMinutes():time.getMinutes();
                    p.firstElementChild.innerHTML = `${hour}:${minute}`;
                    p.firstElementChild.time = `${hour}:${minute}`;

                    Todo.appendChild(p);
                    //将这个结束任务之前保存至其 nextUl 的任务优先级附栏添加至待办栏中，且跟在这个任务后面
                    p.appendChild(p.nextUl);

                    todocount[0].innerHTML = `${++i}`;
                }
                break;
            //点击删除按钮，删除任务
            case "cancel_img":
                let task = p.getElementsByClassName('task')[0];
                if(p_parent === Todo){
                    //根据任务序号删除与本地存储相关联的数组中的对应任务
                    let id_number = task.id.slice(4);
                    let del_index = alltasks.findIndex((elem)=>elem.title==id_number);
                    alltasks.splice(del_index,1);
                    localStorage.setItem('task',JSON.stringify(alltasks));
                    
                    Todo.removeChild(p);
                    
                    todocount[0].innerHTML = `${--i}`;

                    if(Todo.childElementCount == 1){    
                        p_tips1.style.display = "";
                    }

                    //如果待办栏和结束栏位空，将任务计数器置为默认值
                    if(Todo.childElementCount==1 && Done.childElementCount==1){
                        n = 1;
                    }
                }else if(p_parent === Done){
                    let id_number = task.id.slice(4);
                    let del_index = alltasks.findIndex((elem)=>elem.title==id_number);
                    alltasks.splice(del_index,1);
                    localStorage.setItem('task',JSON.stringify(alltasks));

                    Done.removeChild(p);
                    todocount[1].innerHTML = `${--j}`;

                    if(Done.childElementCount === 1){
                        p_tips2.style.display = "";
                    }

                    if(Todo.childElementCount==1 && Done.childElementCount==1){
                        n = 1;
                    }
                }
                break;

            //点击任务优先级按钮，显示任务优先级附栏
            case "prior_img":
                if(p.getElementsByClassName('prior_list')[0]){
                    if(p.getElementsByClassName('prior_list')[0].style.transform === "scale(1)"){
                        p.getElementsByClassName('prior_list')[0].style.transform = "scale(1,0)";
                        p.style.marginBottom = "20px"; 
                    }else{
                        p.getElementsByClassName('prior_list')[0].style.transform = "scale(1)";
                        p.style.marginBottom = "40px"; 
                    }
                }
                break;

            //点击相应级别的优先级，设置任务卡片所对应优先级的视觉提示（这里是添加醒目的左边框颜色）
            case "high":
                p_parent.parentNode.style.borderLeftColor = "rgb(216,30,6)"; /* 这里用 previousElementSibling 是因为要设置的是任务优先级附栏之前也就是所跟着的任务卡片 */
                break;
            case "middle":
                p_parent.parentNode.style.borderLeftColor = "rgb(244,234,42)";
                break;
            case "low":
                p_parent.parentNode.style.borderLeftColor = "rgb(18,150,219)";
                break;
            case "none":
                p_parent.parentNode.style.borderLeftColor = "rgb(191,191,191)";
                break;

            //点击任务栏可以修改任务
            case "task":
                target.innerHTML = `<input class="rtask" id="rtask${target.id.slice(4)}" value="${target.firstChild.nodeValue}">`
                let rinput = document.getElementById(`rtask${target.id.slice(4)}`);
                rinput.style.width="90%";
                rinput.flag = 1;
                rinput.setSelectionRange(0,rinput.value.length);
                rinput.focus();
                break;
            //再次点击修改完成，若第一次输入点击（聚焦）不算修改完成，且内容不能为空
            case "rtask":
                if(target.flag==1){
                    target.flag=0;
                }else if(target.flag==0){
                    if(!target.value){
                        alert("内容不能为空!");
                    }else{
                        p.innerHTML = target.value;
                    }
                }
                break;
            
            //点击导入按钮，导入外部任务
            case 'outdata':
                fetch('../list.txt')
                    .then((response)=>response.text())
                    .then((data)=>{
                        let items = data.split('\r\n');
                        let task_input = document.querySelector("#task");
                        let tasks = document.querySelectorAll(".task");
                        let Mevent = document.createEvent("HTMLEvents");
                        Mevent.initEvent('submit',true,true,document.defaultView);
                        let inputItems = items.filter((item)=>{
                            if(tasks.length > 0){
                                let flag = true;
                                for(let task of tasks){
                                    if(item === task.textContent){
                                        flag = false;
                                        break;
                                    }
                                }
                                return flag;
                            }else{
                                return true;
                            }
                        })

                        inputItems.forEach((inputItem)=>{
                            if(inputItem.length>1){
                                task_input.value = inputItem;
                                document.forms[0].dispatchEvent(Mevent);
                            }
                        })
                    })
                break;
        }
    }

    document.addEventListener("click",allClickEvents,false);
    initialTasks();
    initialDoneTasks();

    window.addEventListener("unload",()=>{
        document.forms[0].removeEventListener("submit",enterDoing,false);
        document.removeEventListener("click",allClickEvents,false);
    })
});

