const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Token', ()=> {
	let token, 
		accounts, 
		deployer,
		reciever

	beforeEach(async () => {
		const Token = await ethers.getContractFactory('Token')
		token = await Token.deploy('Dapp University', 'DAPP', '1000000')
		
		accounts = await ethers.getSigners()
		deployer = accounts[0]
		reciever = accounts[1]
	})

	describe('Deployment', () => {
		const name = 'Dapp University'
		const symbol = 'DAPP'
		const decimals = '18'
		const totalSupply =	tokens('1000000')
		
		it('has correct name', async () => {
			expect(await token.name()).to.equal(name)
		})

		it('has correct symbol', async () => {
			expect(await token.symbol()).to.equal(symbol)
		})

		it('has correct decimals', async () => {
			expect(await token.decimals()).to.equal(decimals)
		})

		it('has correct total supply', async () => {
			expect(await token.totalSupply()).to.equal(totalSupply)
		})

		it('assings total supply to deployer', async () => {
			expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
		})
	
	
	

	})

	describe('Sending Tokens', () => {
		let amount, 
			transaction, 
			result

		describe('Success', () => {
			beforeEach(async () => {
				amount = tokens(100)
				transaction = await token.connect(deployer).transfer(reciever.address, amount)
				result = await transaction.wait()
			})

			it('transfers token balances', async () => {
				expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
				expect(await token.balanceOf(reciever.address)).to.equal(amount)
			})

			it('emits a Transfer event', async () => {
				const event = result.events[0]
				expect(event.event).to.equal('Transfer')

				expect(event.args.from).to.equal(deployer.address)
				expect(event.args.to).to.equal(reciever.address)
				expect(event.args.value).to.equal(amount)
			})
		

		})

		describe('Failure', () => {
			it('rejects insurficient balances', async() => {
				const invalidAmount = tokens(100000000)
				await expect(token.connect(deployer).transfer(reciever.address, invalidAmount)).to.be.reverted
			})
			it('rejects invalid recipent', async() => {
				const amount = tokens(100)
				await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
			})
		})

	})

})
