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

async function liquidityStaking() {
					
						jQuery('.approve').click(function(object) {
							uniPairContract.at("0x1c608235e6a946403f2a048a38550befe41e1b85").approve("0x5CECDbdfB96463045b07d07aAa4fc2F1316F7e47", 10000000000000000000000000, function(err, txhash) {
											console.log(err)
											console.log(txhash)
							})
						})
						
						
						
						let totalSupplyUniV2 = await new Promise(function(resolve, reject) { 
								uniPairContract.at("0x1c608235e6a946403f2a048a38550befe41e1b85").totalSupply.call(function(err, data) {
									if(err !== null) { reject(err) }
									//totalSupply = totalSupply.div(Math.pow(10,18)).toFormat(2);
									resolve(data)
								})
                             })
						var balanceUniV2 = await new Promise(function(resolve, reject) { 
								uniPairContract.at("0x1c608235e6a946403f2a048a38550befe41e1b85").balanceOf(web3.eth.defaultAccount, function(err, data) {
									if(err !== null) { reject(err) }
									resolve(data)
								})
                             })
						let balance = Math.floor((balanceUniV2 / 1E18) * 1000000) / 1000000
						jQuery('.walletBalance')[0].innerText = balance + " UNI-V2"
						
						let liquidityPamp = await new Promise(function(resolve, reject) { 
								tokenContract.at("0xF0FAC7104aAC544e4a7CE1A55ADF2B5a25c65bD1").balanceOf("0x1c608235e6a946403f2a048a38550befe41e1b85", function(err, data) {
									if(err !== null) { reject(err) }
									resolve(data)
								})
                             })
						let liquidityWeth = await new Promise(function(resolve, reject) { 
								wethContract.at("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2").balanceOf("0x1c608235e6a946403f2a048a38550befe41e1b85", function(err, data) {
									if(err !== null) { reject(err) }
									resolve(data)
								})
                             })
						
						let rewardAdjustmentFactor = await new Promise(function(resolve, reject) {
							liquidityContract.at("0x5CECDbdfB96463045b07d07aAa4fc2F1316F7e47").rewardAdjustmentFactor.call(function(err, data) {
									if(err !== null) { reject(err) }
									resolve(data)
								})
						})
						
						jQuery('.liquidity')[0].innerText = `Total Uniswap Liquidity: ${(liquidityWeth / 1E18).toFixed(2)} ETH, ${(liquidityPamp / 1E18).toFixed(2)} PAMP`
						
						currentStaker = await new Promise(function(resolve, reject) { 
								liquidityContract.at("0x5CECDbdfB96463045b07d07aAa4fc2F1316F7e47").getStaker(web3.eth.defaultAccount, function(err, data) {
									if(err !== null) { reject(err) }
									resolve(data)
								})
                             })
						console.log(currentStaker)
						if(currentStaker[1].toNumber() > 0) {
							jQuery('.contractBalance')[0].innerText = Math.floor((currentStaker[1] / 1E18) * 1000000) / 1000000 + " UNI-V2"
							let lastDate = new Date(currentStaker[0].toNumber()*1000)
							jQuery('.days')[0].innerText = timeSince(lastDate)
							
							let expectedRewards = mulDiv(30 * rewardAdjustmentFactor, currentStaker[1], totalSupplyUniV2)
							jQuery('.expectedStaked')[0].innerText = (expectedRewards / 1E18).toFixed(2) + " PAMP"
						}
						
					
						let estimatedPampLiquidity = mulDiv(liquidityPamp, currentStaker[1], totalSupplyUniV2) + mulDiv(liquidityPamp, balanceUniV2, totalSupplyUniV2);
					
						let estimatedWethLiquidity = mulDiv(liquidityWeth, currentStaker[1], totalSupplyUniV2) + mulDiv(liquidityWeth, balanceUniV2, totalSupplyUniV2);
					
						jQuery('.stakerLiquidity')[0].innerText = `Your estimated Uniswap liquidity: ${(estimatedWethLiquidity / 1E18).toFixed(2)} ETH, ${(estimatedPampLiquidity / 1E18).toFixed(2)} PAMP`;
						
						
						let currentAvailableRewards = await new Promise(function(resolve, reject) { 
								liquidityContract.at("0x5CECDbdfB96463045b07d07aAa4fc2F1316F7e47").calculateTokensOwed(web3.eth.defaultAccount, function(err, data) {
									if(err !== null) { reject(err) }
									resolve(data)
								})
                             })
						
						jQuery('.rewards')[0].innerText = (currentAvailableRewards / 1E18).toFixed(2) + " PAMP"
						
						
						jQuery('#numDeposit').change(function() {
							let tokens = parseFloat(jQuery('#numDeposit')[0].value);
							let rewards = mulDiv(30 * rewardAdjustmentFactor, tokens, (totalSupplyUniV2 / 1E18))
							jQuery('.expected')[0].innerText = (rewards / 1E18).toFixed(2) + " PAMP"
						})
						
						
						
						
						jQuery('.deposit').click(function(object) {
							

								let tokens = parseFloat(jQuery('#numDeposit')[0].value);
										tokens = tokens * Math.pow(10, 18);
										if(tokens <= 0 || isNaN(tokens)) {
											return;
										}
										if(tokens > balanceUniV2) {
											window.alert("UNI-V2 balance too low. Your UNI-V2 balance is " + (balanceUniV2 / 1E18))
										} else {
											
											if(currentStaker[1] > 0 && window.confirm(`Warning: Adding more liquidity to your balance will reduce your staking time.`)) {
												liquidityContract.at("0x5CECDbdfB96463045b07d07aAa4fc2F1316F7e47").stakeLiquidityTokens(tokens, function(err, txhash) {
												console.log(err)
												console.log(txhash)
												})
											} else if(currentStaker[1] == 0) {
												liquidityContract.at("0x5CECDbdfB96463045b07d07aAa4fc2F1316F7e47").stakeLiquidityTokens(tokens, function(err, txhash) {
												console.log(err)
												console.log(txhash)
												})
											}
											
										}
											
						})
					
						jQuery('.withdraw').click(function(object) {
							let tokens = parseFloat(jQuery('#numWithdraw')[0].value);
							tokens = tokens * Math.pow(10, 18);
							if(tokens <= 0 || isNaN(tokens)) {
								return;
							}
							if (tokens > currentStaker[1]) {
								window.alert("Contract balance too low. Your UNI-V2 balance in the contract is " + (currentStaker[1] / 1E18))
							} else if (!jQuery('.days')[0].innerText.includes("days")) {
								window.alert("You must stake for at least 2 days to withdraw rewards. You have staked for " + jQuery('.days')[0].innerText)
							} else {
								liquidityContract.at("0x5CECDbdfB96463045b07d07aAa4fc2F1316F7e47").withdrawLiquidityTokens(tokens, function(err, txhash) {
											console.log(err)
											console.log(txhash)
								})
							}
							
						})
						
						
						
						
					
						
					
						

				}
