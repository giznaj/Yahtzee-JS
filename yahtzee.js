var yahtzbox_array=new Array();
		yahtzbox_array[0]=document.yahtzform.invalid; // invalid
		yahtzbox_array[1]=document.yahtzform.yahtzbox1; // 1's
		yahtzbox_array[2]=document.yahtzform.yahtzbox2; // 2's
		yahtzbox_array[3]=document.yahtzform.yahtzbox3; // 3's
		yahtzbox_array[4]=document.yahtzform.yahtzbox4; // 4's
		yahtzbox_array[5]=document.yahtzform.yahtzbox5; // 5's
		yahtzbox_array[6]=document.yahtzform.yahtzbox6; // 6's
		yahtzbox_array[7]=document.yahtzform.yahtzbox7; // 3 of a kind
		yahtzbox_array[8]=document.yahtzform.yahtzbox8; // 4 of a kind
		yahtzbox_array[9]=document.yahtzform.yahtzbox9; //  4 card straight
		yahtzbox_array[10]=document.yahtzform.yahtzbox10; // 5 card straight
		yahtzbox_array[11]=document.yahtzform.yahtzbox11; // full house
		yahtzbox_array[12]=document.yahtzform.yahtzbox12; // chance
		yahtzbox_array[13]=document.yahtzform.yahtzbox13; // yahtzee

// This function will write to the continuous log window

function yahtzlogger(logentry){
			var oldtext=document.yahtzform.yahtzlog.value;
			document.yahtzform.yahtzlog.value+="\r" +logentry+ "";
			scrollElementToEnd(document.yahtzform.yahtzlog);
			}



function yahtzrecords(newrecord){
			var oldrecord=document.yahtzform.yahtzrecords.value;
			document.yahtzform.yahtzrecords.value+="\r" +newrecord+ "";
			}



// This function will put the cursor at the end of the yahtzlog window

function scrollElementToEnd(element){
					element.scrollTop = element.scrollHeight;
					}



// This function disables the 'hold' boxes so that they can't be selected until the first roll is done.  Otherwise no number will show

function disable_hold(){

				{document.yahtzform.chkyahtzbox1.disabled=true;
				document.yahtzform.chkyahtzbox2.disabled=true;
				document.yahtzform.chkyahtzbox3.disabled=true;
				document.yahtzform.chkyahtzbox4.disabled=true;
				document.yahtzform.chkyahtzbox5.disabled=true;
				}
			}



// This function enables the 'hold' boxes so that you can now select which dice to keep.  This has to happen after the initial role

function enable_hold(){
			for(x=1; x<6; x++)
				{document.yahtzform.chkyahtzbox1.disabled=false;
				document.yahtzform.chkyahtzbox2.disabled=false;
				document.yahtzform.chkyahtzbox3.disabled=false;
				document.yahtzform.chkyahtzbox4.disabled=false;
				document.yahtzform.chkyahtzbox5.disabled=false;
				}
			}



// This function checks if the game is over; checks for the bonus (top half >=63) and applies it to the total score if applicable

function score_checker(){
			var name=document.yahtzform.yahtzplayer.value;
			var currentTime=new Date();
			var month=currentTime.getMonth()+1;
			var day=currentTime.getDate();
			var year=currentTime.getFullYear();
			var currentTime=new Date();
			var hours=currentTime.getHours();
			var minutes=currentTime.getMinutes();
			if (minutes < 10)
			minutes="0"+minutes;
			var stamp=(month + "/" + day + "/" + year + " @ " +hours+ ":" +minutes);
			var total=(Number(document.yahtzform.yahtzmsg.value));
			for(x=1; x<14; x++)
				{if((yahtzbox_array[x].value!="")&&(x==13))
					{yahtzlogger("Game over...");
					alert("Game over...");
						if(document.yahtzform.runbonus.value>=63)
							{yahtzlogger("You finished with " +total+ " points...");
							alert("You finished with " +total+ " points...");
							yahtzlogger("You earned the 35 bonus points...");
							alert("You earned the 35 bonus points...");
							total=total+35;
							yahtzlogger("Your new total is now " +total+ " points...");
							document.yahtzform.yahtzmsg.value=total;
							alert("Your new total is now " +total+ " points...");
							yahtzrecords(name+ " - " +total+ " - " +stamp);
							document.yahtzform.nextbutton.disabled=true;
							}
						else
							{yahtzlogger("You didn't earn the bonus points...");
							alert("You didn't earn the bonus points...");
							yahtzlogger("You finished with " +total+ " points...");
							alert("You finished with " +total+ " points...");
							yahtzrecords(name+ " - " +total+ " - " +stamp);
							document.yahtzform.nextbutton.disabled=true;
							}
					}
				else if(yahtzbox_array[x].value=="x")
					{
					}
				else
					{x=14;
					break;
					}
				}
			}



// This function disables a few buttons after the users saves or wastes their round

var done="x";
var first="o";

function yahtzdisable(done){
			var yahtzdisableindex=document.yahtzform.yahtzmenu.selectedIndex;
			yahtzbox_array[yahtzdisableindex].value=done;
			document.yahtzform.rollbutton.disabled=true;
			document.yahtzform.standbutton.disabled=true;
			document.yahtzform.wastebutton.disabled=true;
			document.yahtzform.nextbutton.disabled=false;
			}


// This function alerts the gamer of his cheatn' habbits

var times=0;

function nice_try(){
		times++;
		if(times==1)
			{yahtzlogger("HMMM... MISTAKE?  PLEASE DON'T DO THAT!");
			document.yahtzform.helpbutton.focus();
			}
		else if(times==2)
			{yahtzlogger("OKAY... WE WARNED YOU!  ONE MORE STRIKE LEFT!");
			document.yahtzform.helpbutton.focus();
			}
		else if(times==3)
			{var highscores=document.yahtzform.yahtzrecords.value;
			document.yahtzform.reset();
			document.yahtzform.yahtzrecords.value=highscores;
			document.yahtzform.rollbutton.disabled=true;
			document.yahtzform.standbutton.disabled=true;
			document.yahtzform.wastebutton.disabled=true;
			document.yahtzform.nextbutton.disabled=true;
			document.yahtzform.yahtzmsg.Value="0";
			document.yahtzform.helpbutton.focus();
			times=0;
			document.yahtzform.yahtzlog.value="WOW... YOU DON'T LISTEN AND YOU CHEAT!  GOOD BYE!";
			}
		else
			{}
		}


// This function rolls the random di's for the game

function roll(){
		var turn=(Number(document.yahtzform.yahtzturn.value));
		document.yahtzform.nextbutton.disabled=true;
		++turn;
		document.yahtzform.yahtzturn.value=turn;
		enable_hold();
			if(turn>=3)
			{document.yahtzform.rollbutton.disabled=true;
			}
				if(document.yahtzform.chkyahtzbox1.checked!=true)
				{var num1=(Math.round(Math.random()*5)+1);
				document.yahtzform.yahtzdice1.value=num1;
				}
					if(document.yahtzform.chkyahtzbox2.checked!=true)
					{var num2=(Math.round(Math.random()*5)+1);
					document.yahtzform.yahtzdice2.value=num2;
					}
						if(document.yahtzform.chkyahtzbox3.checked!=true)
						{var num3=(Math.round(Math.random()*5)+1);
						document.yahtzform.yahtzdice3.value=num3;
						}
							if(document.yahtzform.chkyahtzbox4.checked!=true)
							{var num4=(Math.round(Math.random()*5)+1);
							document.yahtzform.yahtzdice4.value=num4;
							}
								if(document.yahtzform.chkyahtzbox5.checked!=true)
								{var num5=(Math.round(Math.random()*5)+1);
								document.yahtzform.yahtzdice5.value=num5;
								}
		}




// This function will let you pick what category you would like to accept a zero for

function wastemy(){
		var yahtzwasteindex=document.yahtzform.yahtzmenu.selectedIndex;

		var num=new Array();
		num[0]=(Number(document.yahtzform.yahtzdice1.value));
		num[1]=(Number(document.yahtzform.yahtzdice2.value));
		num[2]=(Number(document.yahtzform.yahtzdice3.value));
		num[3]=(Number(document.yahtzform.yahtzdice4.value));
		num[4]=(Number(document.yahtzform.yahtzdice5.value));

			if(Number(document.yahtzform.yahtzturn.value==0))
				{yahtzlogger("You haven't rolled the dice yet...");}

			else if(yahtzwasteindex==0)
				{yahtzlogger("You have to choose a category first...");}

			else if(yahtzbox_array[yahtzwasteindex].value=="x")
				{yahtzlogger("You already used this category...");}

			else
				{yahtzdisable(done);
				x=document.yahtzform.yahtzmenu.selectedIndex;
				yahtzlogger("You took a zero for your " +document.yahtzform.yahtzmenu.options[x].text);
				score_checker();
				}
		}


// This function saves your score for the round when picking the category

function yahtzstand(){
		var total=(Number(document.yahtzform.yahtzmsg.value));
		var bonustotal=(Number(document.yahtzform.runbonus.value));
		var yahtzstandindex=document.yahtzform.yahtzmenu.selectedIndex;
		var yahtzstandvalue=document.forms["yahtzform"].yahtzmenu.options[yahtzstandindex].value;

		var num=new Array();
		num[0]=(Number(document.yahtzform.yahtzdice1.value));
		num[1]=(Number(document.yahtzform.yahtzdice2.value));
		num[2]=(Number(document.yahtzform.yahtzdice3.value));
		num[3]=(Number(document.yahtzform.yahtzdice4.value));
		num[4]=(Number(document.yahtzform.yahtzdice5.value));

		var sum=(Number(num[0]+num[1]+num[2]+num[3]+num[4]));

		if(Number(document.yahtzform.yahtzturn.value==0))
			{yahtzlogger("You haven't rolled the dice yet...")}

		else if(yahtzstandindex==0)
			{yahtzlogger("You have to choose a category first...");}

		else if(yahtzbox_array[yahtzstandindex].value=="x")
			{yahtzlogger("You already used this category...");}

		else if(yahtzstandindex==1) // 1's
			if(((((num[0]!=1)&&(num[1]!=1))&&(num[2]!=1))&&(num[3]!=1))&&(num[4]!=1))
				{yahtzlogger("You don't have any 1's...");}
			else
				{var onesum=0;
				for(x=0; x<5; x++)
					{if (num[x]==1)
						{onesum=onesum+1;}
					else
						{}
					}
				document.yahtzform.yahtzmsg.value=onesum+total;
				document.yahtzform.runbonus.value=onesum+bonustotal;
				yahtzdisable(done);
				yahtzlogger("--earned " +onesum+ " points for your 1's");
				score_checker();
				}


		else if(yahtzstandindex==2) // 2's
			if(((((num[0]!=2)&&(num[1]!=2))&&(num[2]!=2))&&(num[3]!=2))&&(num[4]!=2))
				{yahtzlogger("You don't have any 2's...");}
			else
				{var twosum=0;
				for(x=0; x<5; x++)
					{if (num[x]==2)
						{twosum=twosum+2;}
					else
						{}
					}
				document.yahtzform.yahtzmsg.value=twosum+total;
				document.yahtzform.runbonus.value=twosum+bonustotal;
				yahtzdisable(done);
				yahtzlogger("--earned " +twosum+ " points for your 2's");
				score_checker();
				}


		else if(yahtzstandindex==3) // 3's
			if(((((num[0]!=3)&&(num[1]!=3))&&(num[2]!=3))&&(num[3]!=3))&&(num[4]!=3))
				{yahtzlogger("You don't have any 3's...");}
			else
				{var threesum=0;
				for(x=0; x<5; x++)
					{if(num[x]==3)
						{threesum=threesum+3;}
					else
						{}
					}
				document.yahtzform.yahtzmsg.value=threesum+total;
				document.yahtzform.runbonus.value=threesum+bonustotal;
				yahtzdisable(done);
				yahtzlogger("--earned " +threesum+ " points for your 3's");
				score_checker();
				}


		else if(yahtzstandindex==4) // 4's
			if(((((num[0]!=4)&&(num[1]!=4))&&(num[2]!=4))&&(num[3]!=4))&&(num[4]!=4))
				{yahtzlogger("You don't have any 4's...");}
			else
				{var foursum=0;
				for(x=0; x<5; x++)
					{if(num[x]==4)
						{foursum=foursum+4;}
					else
						{}
					}
				document.yahtzform.yahtzmsg.value=foursum+total;
				document.yahtzform.runbonus.value=foursum+bonustotal;
				yahtzdisable(done);
				yahtzlogger("--earned " +foursum+ " points for your 4's");
				score_checker();
				}


		else if(yahtzstandindex==5) // 5's
			if(((((num[0]!=5)&&(num[1]!=5))&&(num[2]!=5))&&(num[3]!=5))&&(num[4]!=5))
				{yahtzlogger("You don't have any 5's...");}
			else
				{var fivesum=0;
				for(x=0; x<5; x++)
					{if(num[x]==5)
						{fivesum=fivesum+5;}
					else
						{}
					}
				document.yahtzform.yahtzmsg.value=fivesum+total;
				document.yahtzform.runbonus.value=fivesum+bonustotal;
				yahtzdisable(done);
				yahtzlogger("--earned " +fivesum+ " points for your 5's");
				score_checker();
				}


		else if(yahtzstandindex==6) // 6's
			if(((((num[0]!=6)&&(num[1]!=6))&&(num[2]!=6))&&(num[3]!=6))&&(num[4]!=6))
				{yahtzlogger("You don't have any 6's...");}
			else
				{var sixsum=0;
				for(x=0; x<5; x++)
					{if(num[x]==6)
						{sixsum=sixsum+6;}
					else
						{}
					}
				document.yahtzform.yahtzmsg.value=sixsum+total;
				document.yahtzform.runbonus.value=sixsum+bonustotal;
				yahtzdisable(done);
				yahtzlogger("--earned " +sixsum+ " points for your 6's");
				score_checker();
				}


		else if(yahtzstandindex==7) // 3 of a kind
		{var sum3kind=0;
		for(x=0; x<7; x++)
			{for(y=0; y<5; y++)
				{if(num[y]==x)
					{sum3kind=sum3kind+1;
						if(sum3kind==3)
							{document.yahtzform.yahtzmsg.value=total+sum;
							x=7;
							y=5;
							yahtzdisable(done);
							yahtzlogger("--earned " +sum+ " points for your 3 of a kind");
							score_checker();
							}
						else if(((sum3kind<3)&&(x==6))&&(y==4))
							{yahtzlogger("you don't have 3 of a kind");
							x=7;
							y=5;
							}
						else if((sum3kind<3)&&(y==4))
							{sum3kind=0;
							}
						else
							{}
					}
				else if(((sum3kind<3)&&(x==6))&&(y==4))
					{yahtzlogger("you don't have 3 of a kind");
					x=7;
					y=5;
					}
				else if ((sum3kind<3)&&(y==4))
					{sum3kind=0;
					}
				else
					{}
				}
			}
		}


		else if(yahtzstandindex==8) // 4 of a kind
		{var sum4kind=0;
		for(x=0; x<7; x++)
			{for(y=0; y<5; y++)
				{if(num[y]==x)
					{sum4kind=sum4kind+1;
						if(sum4kind==4)
							{document.yahtzform.yahtzmsg.value=total+sum;
							x=7;
							y=5;
							yahtzdisable(done);
							yahtzlogger("--earned " +sum+ " points for your 4 of a kind");
							score_checker();
							}
						else if(((sum4kind<4)&&(x==6))&&(y==4))
							{yahtzlogger("you don't have 4 of a kind");
							x=7;
							y=5;
							}
						else if((sum4kind<4)&&(y==4))
							{sum4kind=0;
							}
						else
							{}
					}
				else if(((sum4kind<4)&&(x==6))&&(y==4))
					{yahtzlogger("you don't have 4 of a kind");
					x=7;
					y=5;
					}
				else if((sum4kind<4)&&(y==4))
					{sum4kind=0;
					}
				else
					{}
				}
			}
		}


		else if(yahtzstandindex==9) // Small Straight
			{var smallstr8=0;
			for(x=1; x<7; x++)
				{for(y=0; y<5; y++)
					{if(num[y]==x)
						{smallstr8=smallstr8+1;
							if(smallstr8==4)
								{document.yahtzform.yahtzmsg.value=total+30;
								var sum=30;
								x=7;
								y=5;
								yahtzdisable(done);
								yahtzlogger("--earned " +sum+ " points for your 4 card straight");
								score_checker();
								}
							else if(((x==6))&&((smallstr8<5))&&(y==4))
								{yahtzlogger("you don't have a 4 card straight");
								x=7;
								y=5;
								}
							else
								{y=5;}
						}
					else if(((x==2)&&(smallstr8==1))&&(y==4))
						{smallstr8=0;
						}
					else if(((x==3)&&(smallstr8<=2))&&(y==4))
						{yahtzlogger("you don't have a 4 card straight");
						x=7;
						y=5;
						}
					else if(((x==4)&&(smallstr8<=2))&&(y==4))
						{yahtzlogger("you don't have a 4 card straight");
						x=7;
						y=5;
						}
					else if(((x==5)&&(smallstr8<=3))&&(y==4))
						{yahtzlogger("you don't have a 4 card straight");
						x=7;
						y=5;
						}
					else if(((x==6)&&(smallstr8<4))&&(y==4))
						{yahtzlogger("you don't have a 4 card straight");
						x=7;
						y=5;
						}
					else
						{}
					}
				}
			}

		else if(yahtzstandindex==10)  // Large Straight
			{var largestr8=0;
			for(x=1; x<7; x++)
				{for(y=0; y<5; y++)
					{if(num[y]==x)
						{largestr8=largestr8+1;
							if(largestr8==5)
								{document.yahtzform.yahtzmsg.value=total+40;
								var sum=40;
								x=7;
								y=5;
								yahtzdisable(done);
								yahtzlogger("--earned " +sum+ " points for your 5 card straight");
								score_checker();
								}
							else if(((x==6))&&((largestr8<5))&&(y==4))
								{yahtzlogger("you don't have a 5 card straight");
								x=7;
								y=5;
								}
							else
								{y=5;}
						}
					else if(((x==2)&&(largestr8<=1))&&(y==4))
						{yahtzlogger("you don't have a 5 card straight");
						x=7;
						y=5;
						}
					else if(((x==3)&&(largestr8<=2))&&(y==4))
						{yahtzlogger("you don't have a 5 card straight");
						x=7;
						y=5;
						}
					else if(((x==4)&&(largestr8<=3))&&(y==4))
						{yahtzlogger("you don't have a 5 card straight");
						x=7;
						y=5;
						}
					else if(((x==5))&&((largestr8<5))&&(y==4))
						{yahtzlogger("you don't have a 5 card straight");
						x=7;
						y=5;
						}
					else if(((x==6))&&((largestr8<5))&&(y==4))
						{yahtzlogger("you don't have a 5 card straight");
						x=7;
						y=5;
						}
					else
						{}
					}
				}
			}

		else if(yahtzstandindex==11) // FullHouse
			{var threesum=0; // variable of 3 same cards
			var twosum=0; 	 // variable of 2 same cards
			var threeused=0; // number on dice used for 3 of the same
			var twoused=0;   // number on dice used for 2 of the same
			for(x=1; x<7; x++)
				{for(y=0; y<5; y++)
					{if(num[y]==x)
						{threesum=threesum+1;
							if(threesum==3) // if here, found 3 of a kind
								{threeused=x; // dice used for the 3 of the same
								for(a=1; a<7; a++) // used to be x
									{for(b=0; b<5; b++) // used to be
										{if((num[b]==a)&&(num[b]!=threeused))
											{twosum=twosum+1;
												if(twosum==2) // if here, found OTHER 2 of a kind
													{yahtzform.yahtzmsg.value=total+25
													var sum=25;
													yahtzdisable(done);
													yahtzlogger("--earned " +sum+ " points for your Full House");
													score_checker();
													}
												else if(((twosum<2)&&(a==6))&&(b==4))
													{yahtzlogger("You don't have a full house...");
													a=7;
													b=5;
													}
												else if((twosum<2)&&(b==4))
													{twosum=0;
													}
												else
													{}
											}
										else if(((twosum<2)&&(a==6))&&(b==4))
											{yahtzlogger("You don't have a full house...");
											a=7;
											b=5;
											}
										}
									}
								}
							else if(((threesum<3)&&(x==6))&&(y==4))
								{yahtzlogger("You don't have a full house...");
								x=7;
								y=5;
								}
							else if((threesum<3)&&(y==4))
								{threesum=0;
								}
							else
								{}
						}
					else if (((threesum<3)&&(x==6))&&(y==4))
						{yahtzlogger("You don't have a full house...");
						x=7;
						y=5;
						}
					else if((threesum<3)&&(y==4))
						{threesum=0;
						}
					else
						{}
					}
				}
			}

		else if(yahtzstandindex==12) // Chance
			{document.yahtzform.yahtzmsg.value=total+sum;
			yahtzdisable(done);
			yahtzlogger("--earned " +sum+ " points for your chance");
			score_checker();
			}

		else if(yahtzstandindex==13) // Yahtzee
		{
			if((((num[0]!=num[1])||(num[0]!=num[2]))||(num[0]!=num[3]))||(num[0]!=num[4]))
			{
				yahtzlogger("You don't have a Yahtzee...")};
				if(document.yahtzform.yahtzbox13.value=="o")
				{
					yahtzlogger("--EARNED 100 POINTS FOR YOUR SECOND YAHTZEE!!!");
					document.yahtzform.yahtzmsg.value=total+100;
					yahtzdisable(first);
					score_checker();
				}
				else
				{
					document.yahtzform.yahtzmsg.value=total+50;
					yahtzlogger("--earned 50 points for your first YAHTZEE!");
					yahtzdisable(first);
					score_checker();
				}
			}
		else
			{}
		}



// This function enables all of the buttons, clears all the checkboxes and starts a new turn

function nextturn(){
		document.yahtzform.chkyahtzbox1.checked=false;
		document.yahtzform.chkyahtzbox2.checked=false;
		document.yahtzform.chkyahtzbox3.checked=false;
		document.yahtzform.chkyahtzbox4.checked=false;
		document.yahtzform.chkyahtzbox5.checked=false;
		document.yahtzform.yahtzdice1.value="";
		document.yahtzform.yahtzdice2.value="";
		document.yahtzform.yahtzdice3.value="";
		document.yahtzform.yahtzdice4.value="";
		document.yahtzform.yahtzdice5.value="";
		document.yahtzform.yahtzmenu.selectedIndex=0;
		document.yahtzform.yahtzturn.value=0;
		document.yahtzform.rollbutton.disabled=false;
		document.yahtzform.standbutton.disabled=false;
		document.yahtzform.wastebutton.disabled=false;
		document.yahtzform.nextbutton.disabled=true;
		disable_hold();
		}



// This function resets the form, enalbles all of the boxes and starts a new game

function new_game()
{
  var yesno=window.confirm("Previous game will be lost.  Are you sure?");
	if(yesno==true)
	{
    var recordlist=document.yahtzform.yahtzrecords.value;
		document.yahtzform.reset();
		document.yahtzform.yahtzrecords.value=recordlist;
		document.yahtzform.rollbutton.disabled=false;
		document.yahtzform.standbutton.disabled=false;
		document.yahtzform.wastebutton.disabled=false;
		document.yahtzform.nextbutton.disabled=true;
		document.yahtzform.yahtzmsg.Value="0";
		document.yahtzform.yahtzlog.value="Good Luck...";
		document.yahtzform.yahtzplayer.value="name?";
		disable_hold();
  }
	else
	{}
}



// This function opens up a basic help alert message box -->

function help_alert(){
		alert(" roll dice = rolls the dice \n take score = saves the points for selected category \n next turn = starts next turn, resets roll back to 0 \n help = displays this help text \n take zero = category accepting a zero for \n \n 4CS = 4 card straight \n 5CS = 5 card straight \n FH = full house \n 3K = 3 of a kind \n 4K = 4 of a kind \n ? = chance \n Y = yahtzee \n \n running bonus = current upper deck score \n 63 or higher gets you 35 at the end \n \n http://en.wikipedia.org/wiki/Yahtzee");
			}

//-->