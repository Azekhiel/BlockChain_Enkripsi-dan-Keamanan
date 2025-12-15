> var latestBlock = eth.getBlock("latest")
undefined
> latestBlock.number
4147
> latestBlock.parentHash
"0x79d568e1f5dac996bd4219d006c49a90a43f4140a53a05217bcb89976a33bbd6"
> var previousBlock = eth.getBlock(latestBlock.parentHash)
undefined
> previousBlock.number
4146
> previousBlock.hash
		Y^"0x79d568e1f5dac996bd4219d006c49a90a43f4140a53a05217bcb89976a33bbd6"34zr.