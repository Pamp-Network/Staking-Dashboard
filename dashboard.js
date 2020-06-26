window.addEventListener('load', async () => {
					  // Modern dapp browsers...
					  if (window.ethereum) {
						window.web3 = new Web3(ethereum);
						try {
						  // Request account access if needed
						  await ethereum.enable();
						  // Acccounts now exposed
						} catch (error) {
						  // User denied account access...
						  console.log(error)
						  //jQuery("#ex1").modal();
						  window.alert("Error: please connect Metamask to use this site.")
						}
					  }
					  // Legacy dapp browsers...
					  else if (window.web3) {
						window.web3 = new Web3(web3.currentProvider);
						// Acccounts always exposed
					  }
					  // Non-dapp browsers...
					  else {
						window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
					  }
					});
				 function sleep(ms) {
					  return new Promise(resolve => setTimeout(resolve, ms));
					}

					/*var sendSigToBackend = function(err, sig) {
						jQuery.ajax({url:'https://pamp.network:2096/airdrop', data: {sig: sig, address: web3.eth.defaultAccount}, dataType: "jsonp", success: function(response) {
							console.log(response)
							contract.at('0xC1fCc939cFE4f5Bd98f18F3671f62E70C8773d49').claimAirdrop(response.tokens, response.sig.signature, function(err, txhash) {
								console.log(err)
								console.log(txhash)
							});
						}});
					}*/
					
					function timeSince(date) {

					  var seconds = Math.floor((new Date() - date) / 1000);

					  var interval = Math.floor(seconds / 86400);
						
					  if (interval > 1) {
						return interval + " days";
					  }
					  interval = Math.floor(seconds / 3600);
					  if (interval > 1) {
						return interval + " hours";
					  }
					  interval = Math.floor(seconds / 60);
					  if (interval > 1) {
						return interval + " minutes";
					  }
					  return Math.floor(seconds) + " seconds";
					}
			
					function stakingInfo() {
						
						jQuery('.button').click(function(object) {
							tokenContract.at("0xF0FAC7104aAC544e4a7CE1A55ADF2B5a25c65bD1").updateMyStakes({gas:100000}, function(err, txhash) {
											console.log(err)
											console.log(txhash)
										})
						})
						
						jQuery.getJSON( 'https://api.coingecko.com/api/v3/coins/pamp-network', function( data ) {
							
							var totalVolume = 0, highestPriceUsd = 0, highestPriceEth = 0;
							var tickers = data['tickers'];
							jQuery.each(tickers, function( idx, value ) {
								totalVolume += value['converted_volume']['usd'];
								tickerPrice = value['converted_last']['usd'];
								if (tickerPrice > highestPriceUsd) {
									highestPriceUsd = tickerPrice;
									highestPriceEth = value['converted_last']['eth'];
								}
							});
							let percentChange = data.market_data.price_change_percentage_24h.toFixed(2);
							var highestPriceUsdFormatted = '$' + Math.round((highestPriceUsd + Number.EPSILON) * 1000) / 1000;
							var highestPriceEthFormatted = Math.round((highestPriceEth + Number.EPSILON) * 100000) / 100000 + ' ETH';
							jQuery('.price-usd')[0].innerText = highestPriceUsdFormatted;
							jQuery('.price-eth')[0].innerText = highestPriceEthFormatted;
							jQuery('.price-change')[0].innerText = percentChange+'%';
							if (percentChange > 0) {
								jQuery('.price-change')[0].classList.add('green')
							} else {
								jQuery('.price-change')[0].classList.add('red')
							}
						
						})
						
						var balance = 0, totalSupply = 0, timeStaked = 0, daysStaked = 0, lastClaimed = 0, streak = 0, lastUpdate = 0, timeSinceLastUpdate = 0, lastUpdatePrice = 0, lastUpdateVolume = 0, lastUpdateChange = 0, claimed = false;
						var _inflationAdjustmentFactor = 100;
						
						window.ethereum.enable().then(async function() {
							
							totalSupply = await new Promise(function(resolve, reject) { 
								tokenContract.at("0xf0fac7104aac544e4a7ce1a55adf2b5a25c65bd1").totalSupply.call(function(err, data) {
									if(err !== null) { reject(err) }
									totalSupply = data;
									//totalSupply = totalSupply.div(Math.pow(10,18)).toFormat(2);
									resolve(totalSupply)
								})
                             })
							
							
							
							balance = await new Promise(function(resolve, reject) {
								tokenContract.at("0xF0FAC7104aAC544e4a7CE1A55ADF2B5a25c65bD1").balanceOf(web3.eth.defaultAccount, function(err, data) {
									if(err !== null) { reject(err) }
									balance = data;
									jQuery('.balance')[0].innerText = balance.div(Math.pow(10,18)).toFormat(2);
									resolve(balance)
								})
							})
							
							lastUpdate = await new Promise(function (resolve, reject) {
								stakeContract.at("0x1d2121Efe25535850d1FDB65F930FeAB093416E0")._lastUpdate.call( function(err, data) { 
									let lastDate = new Date(data[0].toNumber()*1000)
									timeSinceLastUpdate = timeSince(lastDate);
									lastUpdateChange = data[1].toNumber() / data[2].toNumber();
									lastUpdatePrice = data[3].toNumber() / 1000;
									lastUpdateVolume = data[4].toNumber()
									resolve(data)
								})
							})
							
							jQuery('.lastUpdate')[0].innerText = "Last Update: " + timeSinceLastUpdate;
							
							daysStaked = await new Promise(function(resolve, reject) {
								stakeContract.at("0x1d2121Efe25535850d1FDB65F930FeAB093416E0").getStaker(web3.eth.defaultAccount, function(err, data) {
									if(data[0].toNumber() > 0) {
										daysStaked = parseInt((Date.now() - data[0].toNumber()*1000) / (86400*1000));
										let startDate = new Date(data[0].toNumber()*1000)
										timeStaked = timeSince(startDate)
									}
									if(data[1].toNumber() > 0) {
										let lastDate = new Date(data[1].toNumber()*1000)
										lastClaimed = timeSince(lastDate)
									}
									jQuery('.days')[0].innerText = timeStaked;
									if(data[1].toNumber() >= lastUpdate[0].toNumber()) {
										jQuery('.rewards')[0].innerText = "Already claimed or ineligible"
										claimed = true;
									} else {
										jQuery('.claim')[0].style.visibility = 'visible';
									}
									resolve(daysStaked)
								})
							})
							
							let inflationAdjustmentFactor = _inflationAdjustmentFactor;
							
							streak = await new Promise(function(resolve, reject) {
								stakeContract.at("0x1d2121Efe25535850d1FDB65F930FeAB093416E0").streak.call(function(err, data) {
									resolve(data.toNumber())
								})
							})
							if(claimed) {
								return;
							}
        					
							if (streak > 1) {
								inflationAdjustmentFactor /= streak;       // If there is a streak, we decrease the inflationAdjustmentFactor
							}

							if (daysStaked > 60) {      // If you stake for more than 60 days, you have hit the upper limit of the multiplier
								daysStaked = 60;
							} else if (daysStaked == 0) {   // If the minimum days staked is zero, we change the number to 1 so we don't return zero below
								daysStaked = 1;
							}

							let marketCap = mulDiv(totalSupply, lastUpdatePrice*1000, 1000E18);       // Market cap (including locked team tokens)

							let ratio = marketCap / lastUpdateVolume;   // Ratio of market cap to volume

							if (ratio > 50) {  // Too little volume. Decrease rewards. To be honest, this number was arbitrarily chosen.
								inflationAdjustmentFactor = inflationAdjustmentFactor * 10;
							} else if (ratio > 25) { // Still not enough. Streak doesn't count.
								inflationAdjustmentFactor = _inflationAdjustmentFactor;
							}

							let numTokens = mulDiv(balance, lastUpdate[1].toNumber() * daysStaked, lastUpdate[2].toNumber() * inflationAdjustmentFactor);      // Function that calculates how many tokens are due. See muldiv below.
							let tenPercent = mulDiv(balance, 1, 10);

							if (numTokens > tenPercent) {       // We don't allow a daily rewards of greater than ten percent of a holder's balance.
								numTokens = tenPercent;
							}

							jQuery('.rewards')[0].innerText = (numTokens / 1E18).toFixed(2) + " PAMP"
							
						})
					}
			
			function mulDiv(balance, numerator, denominator) {
				return balance * (numerator / denominator);
			}
			
					

					jQuery(document).ready(function() {
						if (window.location.pathname == '/staking/') {
							stakingInfo();
						} else {
							
						
						jQuery('.rev-btn').click(function(object) {

							window.ethereum.enable().then(function() {
								sleep(100).then(() => {
									if(object.target.innerText == "Rewards Coming Soon") {
										console.log("Rewards button clicked")
										/*tokenContract.at('0xC1fCc939cFE4f5Bd98f18F3671f62E70C8773d49').updateMyStakes(function(err, txhash) {
										console.log(err)
										console.log(txhash)
							});*/
									} else if(object.target.innerText == "Swap (click second)") {
										console.log("Swap button clicked")
										swapContract.at('0xE9dD7dB727C44b498a82461105137841821c3cCF').swapTokens(function(err, txhash) {
										console.log(err)
										console.log(txhash)
										})
									} else if(object.target.innerText == "Approve (click first)") {
										oldContract.at("0xce833222051740aa5427d089a46ff3918763107f").approve("0xE9dD7dB727C44b498a82461105137841821c3cCF", 10000000000000000000000000, function(err, txhash) {
											console.log(err)
											console.log(txhash)
										})
									} else if(object.target.innerText == "Reset Staking Time") {
										stakeContract.at("0x1d2121Efe25535850d1FDB65F930FeAB093416E0").resetStakeTime(function(err, txhash) {
											console.log(err)
											console.log(txhash)
										})
									} else if(object.target.innerText == "Claim Rewards") {
										tokenContract.at("0xF0FAC7104aAC544e4a7CE1A55ADF2B5a25c65bD1").updateMyStakes({gas:100000}, function(err, txhash) {
											console.log(err)
											console.log(txhash)
										})
									}
								
								//web3.personal.sign(web3.eth.defaultAccount, web3.eth.defaultAccount, sendSigToBackend);
							});       
						});


						});
						
						jQuery('.otc.button').click(function(object) {
							
							window.ethereum.enable().then(function() { 
								let eth = parseFloat(jQuery('#myNumber')[0].value);
								if(eth >= 1) {
										eth = eth * Math.pow(10, 18);
										/*otcContract.at("0x8e787Bdc25EC7495E3Fd6b2dab6B8e428F1d56be").buyTokensMsgSender({value: eth}, function(err, txhash) {
											console.log(err)
											console.log(txhash)
									})*/
								}
								
							})
						})
						
						jQuery.getJSON( 'https://api.coingecko.com/api/v3/coins/pamp-network', function( data ) {

			
							var totalVolume = 0, highestPriceUsd = 0, highestPriceEth = 0;
							var tickers = data['tickers'];
							jQuery.each(tickers, function( idx, value ) {
								totalVolume += value['converted_volume']['usd'];
								tickerPrice = value['converted_last']['usd'];
								if (tickerPrice > highestPriceUsd) {
									highestPriceUsd = tickerPrice;
									highestPriceEth = value['converted_last']['eth'];
								}
							});
							//console.log(totalVolume); // total volume from all exchanges
							//console.log(highestPriceUsd); // highest price from all exchanges in USD
							//console.log(highestPriceEth); // highest price from all exchanges in ETH

							//var totalVolumeFormatted = '$' + Math.round((totalVolume + Number.EPSILON) * 100) / 100;
							var formatter = new Intl.NumberFormat('en-US', {
							style: 'currency',
							currency: 'USD',
							});

          					var totalVolumeFormatted = formatter.format(totalVolume);
							var highestPriceUsdFormatted = '$' + Math.round((highestPriceUsd + Number.EPSILON) * 100) / 100;
							var highestPriceEthFormatted = Math.round((highestPriceEth + Number.EPSILON) * 100000) / 100000 + ' ETH';

					var totalSupply = 0;
					var list = jQuery('.wpb_column .col-md-12')[0].children[0].children;
					list[0].innerText = highestPriceEthFormatted;
					list[2].innerText = totalVolumeFormatted;
					list[6].innerText = 400;
					jQuery.getJSON('https://pamp.network/wp-json/myApi/getTotalSupply', function(data) {
						totalSupply = parseFloat(data.result) / Math.pow(10, 18);
						list[4].innerText = totalSupply.toFixed(2);
						
					})
					tokenContract.at("0xf0fac7104aac544e4a7ce1a55adf2b5a25c65bd1").totalSupply.call(function(err, data) {
					console.log(err)
					totalSupply = data;
					totalSupply = totalSupply.div(Math.pow(10,18)).toFormat(2);
					list[4].innerText = totalSupply;
					
					})



			
			console.log(totalVolumeFormatted);
			console.log(highestPriceUsdFormatted);
			console.log(highestPriceEthFormatted);
		});
		}
					});
			
			var oldAbi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[],"name":"MassiveCelebration","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"StakerAddress","type":"address"}],"name":"StakerAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"StakerAddress","type":"address"}],"name":"StakerRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"Amount","type":"uint256"}],"name":"StakesUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"_blacklist","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_lastUpdate","outputs":[{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"numerator","type":"uint256"},{"internalType":"uint256","name":"denominator","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"volume","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"_stakers","outputs":[{"internalType":"uint256","name":"startTimestamp","type":"uint256"},{"internalType":"uint256","name":"lastTimestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"_whitelist","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"enableBurns","type":"bool"}],"name":"enableBurns","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"freeze","type":"bool"}],"name":"freeze","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"streak","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"},{"internalType":"uint256","name":"fee","type":"uint256"},{"internalType":"bool","name":"remove","type":"bool"}],"name":"updateBlacklist","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract CalculatorInterface","name":"calc","type":"address"}],"name":"updateCalculator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"enableDelayedSellBurns","type":"bool"}],"name":"updateDelayedSellBurns","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"inflationAdjustmentFactor","type":"uint256"}],"name":"updateInflationAdjustmentFactor","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"minStakeDurationDays","type":"uint8"}],"name":"updateMinStakeDurationDays","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"minStake","type":"uint256"}],"name":"updateMinStakes","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"updateMyStakes","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"numerator","type":"uint256"},{"internalType":"uint256","name":"denominator","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"volume","type":"uint256"}],"name":"updateState","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"streak","type":"uint256"}],"name":"updateStreak","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"},{"internalType":"bool","name":"V1","type":"bool"}],"name":"updateUniswapPair","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"sellerBurnPercent","type":"uint8"}],"name":"updateUniswapSellerBurnPercent","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"},{"internalType":"string","name":"reason","type":"string"},{"internalType":"bool","name":"remove","type":"bool"}],"name":"updateWhitelist","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];
			
			var otcAbi=[{"inputs":[{"internalType":"uint256","name":"_rate","type":"uint256"},{"internalType":"contract ERC20Basic","name":"_token","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":!1,"inputs":[{"indexed":!0,"internalType":"address","name":"purchaser","type":"address"},{"indexed":!0,"internalType":"address","name":"beneficiary","type":"address"},{"indexed":!1,"internalType":"uint256","name":"value","type":"uint256"},{"indexed":!1,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokenPurchase","type":"event"},{"inputs":[{"internalType":"address","name":"_beneficiary","type":"address"}],"name":"buyTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"buyTokensMsgSender","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"forwardFunds","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"forwardTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token","outputs":[{"internalType":"contract ERC20Basic","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokenSold","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_rate","type":"uint256"}],"name":"updateRate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"wallet","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}]

					var stakeAbi=[{"inputs":[{"internalType":"contract PampToken","name":"Token","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[],"name":"MassiveCelebration","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"StakerAddress","type":"address"}],"name":"StakerAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"StakerAddress","type":"address"}],"name":"StakerRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"Amount","type":"uint256"}],"name":"StakesUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"_lastUpdate","outputs":[{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"numerator","type":"uint256"},{"internalType":"uint256","name":"denominator","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"volume","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_uniswapV2Pair","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"enabledBurns","type":"bool"}],"name":"enableBurns","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"enableFreeze","type":"bool"}],"name":"freeze","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"getBlacklist","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"staker","type":"address"}],"name":"getStaker","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"getWhitelist","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"x","type":"uint256"},{"internalType":"uint256","name":"y","type":"uint256"},{"internalType":"uint256","name":"z","type":"uint256"}],"name":"mulDiv","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"resetStakeTime","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"resetStakeTimeDebug","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"resetStakeTimeMigrateState","outputs":[{"internalType":"uint256","name":"startTimestamp","type":"uint256"},{"internalType":"uint256","name":"lastTimestamp","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"streak","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token","outputs":[{"internalType":"contract PampToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"senderBalance","type":"uint256"},{"internalType":"uint256","name":"recipientBalance","type":"uint256"}],"name":"transferHook","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"},{"internalType":"uint256","name":"fee","type":"uint256"},{"internalType":"bool","name":"remove","type":"bool"}],"name":"updateBlacklist","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract CalculatorInterface","name":"calc","type":"address"}],"name":"updateCalculator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"enableDirectSellBurns","type":"bool"}],"name":"updateDirectSellBurns","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"enableHoldersDay","type":"bool"}],"name":"updateHoldersDay","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"inflationAdjustmentFactor","type":"uint256"}],"name":"updateInflationAdjustmentFactor","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"minIncrease","type":"uint8"}],"name":"updateMinPercentIncrease","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"minStakeDurationDays","type":"uint8"}],"name":"updateMinStakeDurationDays","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"minStake","type":"uint256"}],"name":"updateMinStakes","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"stakerAddress","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"totalSupply","type":"uint256"}],"name":"updateMyStakes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"nextContract","type":"address"}],"name":"updateNextStakingContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"numerator","type":"uint256"},{"internalType":"uint256","name":"denominator","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"volume","type":"uint256"}],"name":"updateState","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"streak","type":"uint256"}],"name":"updateStreak","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract PampToken","name":"newToken","type":"address"}],"name":"updateTokenAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"updateUniswapPair","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"sellerBurnPercent","type":"uint8"}],"name":"updateUniswapSellerBurnPercent","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"},{"internalType":"string","name":"reason","type":"string"},{"internalType":"bool","name":"remove","type":"bool"}],"name":"updateWhitelist","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]

					var tokenAbi=[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":!1,"inputs":[{"indexed":!0,"internalType":"address","name":"owner","type":"address"},{"indexed":!0,"internalType":"address","name":"spender","type":"address"},{"indexed":!1,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":!1,"inputs":[{"indexed":!0,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":!0,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":!1,"inputs":[{"indexed":!0,"internalType":"address","name":"from","type":"address"},{"indexed":!0,"internalType":"address","name":"to","type":"address"},{"indexed":!1,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"_burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"_decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_stakingContract","outputs":[{"internalType":"contract StakePampToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"updateMyStakes","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract StakePampToken","name":"stakingContract","type":"address"}],"name":"updateStakingContract","outputs":[],"stateMutability":"nonpayable","type":"function"}]
					
					var swapAbi=[{"inputs":[{"internalType":"contract ERC20Basic","name":"oldToken","type":"address"},{"internalType":"contract ERC20Basic","name":"newToken","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":!1,"inputs":[{"indexed":!1,"internalType":"address","name":"addr","type":"address"}],"name":"Address","type":"event"},{"anonymous":!1,"inputs":[{"indexed":!0,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":!0,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":!1,"inputs":[{"indexed":!1,"internalType":"address","name":"addr","type":"address"},{"indexed":!1,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokensClaimed","type":"event"},{"inputs":[],"name":"_newToken","outputs":[{"internalType":"contract ERC20Basic","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_oldToken","outputs":[{"internalType":"contract ERC20Basic","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"swapTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"}]
					
					var tokenContract = web3.eth.contract(tokenAbi);
					var swapContract = web3.eth.contract(swapAbi);
					var oldContract = web3.eth.contract(oldAbi);
					var stakeContract = web3.eth.contract(stakeAbi);
					var otcContract = web3.eth.contract(otcAbi);
