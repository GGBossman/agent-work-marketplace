// Auto-extracted from Foundry compilation output
// JobEscrow and AgentRegistry ABIs for Agent Work Marketplace

export const JOB_ESCROW_ABI = [
	{
		type: "constructor",
		inputs: [
			{
				name: "_agentRegistry",
				type: "address",
				internalType: "address"
			},
			{
				name: "_treasury",
				type: "address",
				internalType: "address"
			},
			{
				name: "initialOwner",
				type: "address",
				internalType: "address"
			}
		],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "agentAccept",
		inputs: [
			{
				name: "jobId",
				type: "bytes32",
				internalType: "bytes32"
			}
		],
		outputs: [],
		stateMutability: "payable"
	},
	{
		type: "function",
		name: "agentRegistry",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "address",
				internalType: "contract IAgentRegistry"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "assignAgent",
		inputs: [
			{
				name: "jobId",
				type: "bytes32",
				internalType: "bytes32"
			},
			{
				name: "agent",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "cancelJob",
		inputs: [
			{
				name: "jobId",
				type: "bytes32",
				internalType: "bytes32"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "confirmDelivery",
		inputs: [
			{
				name: "jobId",
				type: "bytes32",
				internalType: "bytes32"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "createJob",
		inputs: [
			{
				name: "taskDescription",
				type: "string",
				internalType: "string"
			},
			{
				name: "deadline",
				type: "uint256",
				internalType: "uint256"
			}
		],
		outputs: [
			{
				name: "jobId",
				type: "bytes32",
				internalType: "bytes32"
			}
		],
		stateMutability: "payable"
	},
	{
		type: "function",
		name: "fileDispute",
		inputs: [
			{
				name: "jobId",
				type: "bytes32",
				internalType: "bytes32"
			}
		],
		outputs: [],
		stateMutability: "payable"
	},
	{
		type: "function",
		name: "getJob",
		inputs: [
			{
				name: "jobId",
				type: "bytes32",
				internalType: "bytes32"
			}
		],
		outputs: [
			{
				name: "",
				type: "tuple",
				internalType: "struct IJobEscrow.Job",
				components: [
					{
						name: "jobId",
						type: "bytes32",
						internalType: "bytes32"
					},
					{
						name: "buyer",
						type: "address",
						internalType: "address"
					},
					{
						name: "agent",
						type: "address",
						internalType: "address"
					},
					{
						name: "escrowAmount",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "stakeAmount",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "taskDescription",
						type: "string",
						internalType: "string"
					},
					{
						name: "status",
						type: "uint8",
						internalType: "enum IJobEscrow.JobStatus"
					},
					{
						name: "deadline",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "createdAt",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "deliveredAt",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "deliverableURI",
						type: "string",
						internalType: "string"
					}
				]
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "initiateAutoRelease",
		inputs: [
			{
				name: "jobId",
				type: "bytes32",
				internalType: "bytes32"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "owner",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "address",
				internalType: "address"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "renounceOwnership",
		inputs: [],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "setTreasury",
		inputs: [
			{
				name: "_treasury",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "submitDeliverable",
		inputs: [
			{
				name: "jobId",
				type: "bytes32",
				internalType: "bytes32"
			},
			{
				name: "deliverableURI",
				type: "string",
				internalType: "string"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "transferOwnership",
		inputs: [
			{
				name: "newOwner",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "treasury",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "address",
				internalType: "address"
			}
		],
		stateMutability: "view"
	},
	{
		type: "event",
		name: "AgentAccepted",
		inputs: [
			{
				name: "jobId",
				type: "bytes32",
				indexed: true,
				internalType: "bytes32"
			},
			{
				name: "agent",
				type: "address",
				indexed: true,
				internalType: "address"
			},
			{
				name: "stakeAmount",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "AutoReleaseTriggered",
		inputs: [
			{
				name: "jobId",
				type: "bytes32",
				indexed: true,
				internalType: "bytes32"
			},
			{
				name: "agentPayout",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			},
			{
				name: "fullRelease",
				type: "bool",
				indexed: false,
				internalType: "bool"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "DeliverableSubmitted",
		inputs: [
			{
				name: "jobId",
				type: "bytes32",
				indexed: true,
				internalType: "bytes32"
			},
			{
				name: "deliverableURI",
				type: "string",
				indexed: false,
				internalType: "string"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "DeliveryConfirmed",
		inputs: [
			{
				name: "jobId",
				type: "bytes32",
				indexed: true,
				internalType: "bytes32"
			},
			{
				name: "agentPayout",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			},
			{
				name: "platformFee",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "DisputeFiled",
		inputs: [
			{
				name: "jobId",
				type: "bytes32",
				indexed: true,
				internalType: "bytes32"
			},
			{
				name: "initiator",
				type: "address",
				indexed: true,
				internalType: "address"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "JobAssigned",
		inputs: [
			{
				name: "jobId",
				type: "bytes32",
				indexed: true,
				internalType: "bytes32"
			},
			{
				name: "agent",
				type: "address",
				indexed: true,
				internalType: "address"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "JobCancelled",
		inputs: [
			{
				name: "jobId",
				type: "bytes32",
				indexed: true,
				internalType: "bytes32"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "JobCreated",
		inputs: [
			{
				name: "jobId",
				type: "bytes32",
				indexed: true,
				internalType: "bytes32"
			},
			{
				name: "buyer",
				type: "address",
				indexed: true,
				internalType: "address"
			},
			{
				name: "amount",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			},
			{
				name: "deadline",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "OwnershipTransferred",
		inputs: [
			{
				name: "previousOwner",
				type: "address",
				indexed: true,
				internalType: "address"
			},
			{
				name: "newOwner",
				type: "address",
				indexed: true,
				internalType: "address"
			}
		],
		anonymous: false
	},
	{
		type: "error",
		name: "OwnableInvalidOwner",
		inputs: [
			{
				name: "owner",
				type: "address",
				internalType: "address"
			}
		]
	},
	{
		type: "error",
		name: "OwnableUnauthorizedAccount",
		inputs: [
			{
				name: "account",
				type: "address",
				internalType: "address"
			}
		]
	},
	{
		type: "error",
		name: "ReentrancyGuardReentrantCall",
		inputs: []
	}
] as const;

export const AGENT_REGISTRY_ABI = [
	{
		type: "constructor",
		inputs: [
			{
				name: "initialOwner",
				type: "address",
				internalType: "address"
			}
		],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "decrementActiveJobs",
		inputs: [
			{
				name: "agent",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "getActiveJobs",
		inputs: [
			{
				name: "agent",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [
			{
				name: "",
				type: "uint256",
				internalType: "uint256"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "getAgentProfile",
		inputs: [
			{
				name: "agent",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [
			{
				name: "",
				type: "tuple",
				internalType: "struct IAgentRegistry.AgentProfile",
				components: [
					{
						name: "agentAddress",
						type: "address",
						internalType: "address"
					},
					{
						name: "erc8004Identity",
						type: "bytes32",
						internalType: "bytes32"
					},
					{
						name: "metadataURI",
						type: "string",
						internalType: "string"
					},
					{
						name: "tier",
						type: "uint8",
						internalType: "enum IAgentRegistry.AgentTier"
					},
					{
						name: "isAvailable",
						type: "bool",
						internalType: "bool"
					},
					{
						name: "completedJobs",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "disputedJobs",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "currentStake",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "activeJobs",
						type: "uint256",
						internalType: "uint256"
					},
					{
						name: "registeredAt",
						type: "uint256",
						internalType: "uint256"
					}
				]
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "getAgentTier",
		inputs: [
			{
				name: "agent",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [
			{
				name: "",
				type: "uint8",
				internalType: "enum IAgentRegistry.AgentTier"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "incrementActiveJobs",
		inputs: [
			{
				name: "agent",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "isRegistered",
		inputs: [
			{
				name: "agent",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [
			{
				name: "",
				type: "bool",
				internalType: "bool"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "jobEscrow",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "address",
				internalType: "address"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "owner",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "address",
				internalType: "address"
			}
		],
		stateMutability: "view"
	},
	{
		type: "function",
		name: "recordJobCompletion",
		inputs: [
			{
				name: "agent",
				type: "address",
				internalType: "address"
			},
			{
				name: "hadDispute",
				type: "bool",
				internalType: "bool"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "registerAgent",
		inputs: [
			{
				name: "erc8004Identity",
				type: "bytes32",
				internalType: "bytes32"
			},
			{
				name: "metadataURI",
				type: "string",
				internalType: "string"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "renounceOwnership",
		inputs: [],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "setJobEscrow",
		inputs: [
			{
				name: "_jobEscrow",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "stakeForTier",
		inputs: [],
		outputs: [],
		stateMutability: "payable"
	},
	{
		type: "function",
		name: "transferOwnership",
		inputs: [
			{
				name: "newOwner",
				type: "address",
				internalType: "address"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "unstake",
		inputs: [
			{
				name: "amount",
				type: "uint256",
				internalType: "uint256"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "function",
		name: "updateAvailability",
		inputs: [
			{
				name: "available",
				type: "bool",
				internalType: "bool"
			}
		],
		outputs: [],
		stateMutability: "nonpayable"
	},
	{
		type: "event",
		name: "AgentRegistered",
		inputs: [
			{
				name: "agent",
				type: "address",
				indexed: true,
				internalType: "address"
			},
			{
				name: "identity",
				type: "bytes32",
				indexed: true,
				internalType: "bytes32"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "AvailabilityChanged",
		inputs: [
			{
				name: "agent",
				type: "address",
				indexed: true,
				internalType: "address"
			},
			{
				name: "available",
				type: "bool",
				indexed: false,
				internalType: "bool"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "OwnershipTransferred",
		inputs: [
			{
				name: "previousOwner",
				type: "address",
				indexed: true,
				internalType: "address"
			},
			{
				name: "newOwner",
				type: "address",
				indexed: true,
				internalType: "address"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "StakeDeposited",
		inputs: [
			{
				name: "agent",
				type: "address",
				indexed: true,
				internalType: "address"
			},
			{
				name: "amount",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "StakeWithdrawn",
		inputs: [
			{
				name: "agent",
				type: "address",
				indexed: true,
				internalType: "address"
			},
			{
				name: "amount",
				type: "uint256",
				indexed: false,
				internalType: "uint256"
			}
		],
		anonymous: false
	},
	{
		type: "event",
		name: "TierPromoted",
		inputs: [
			{
				name: "agent",
				type: "address",
				indexed: true,
				internalType: "address"
			},
			{
				name: "newTier",
				type: "uint8",
				indexed: false,
				internalType: "enum IAgentRegistry.AgentTier"
			}
		],
		anonymous: false
	},
	{
		type: "error",
		name: "OwnableInvalidOwner",
		inputs: [
			{
				name: "owner",
				type: "address",
				internalType: "address"
			}
		]
	},
	{
		type: "error",
		name: "OwnableUnauthorizedAccount",
		inputs: [
			{
				name: "account",
				type: "address",
				internalType: "address"
			}
		]
	}
] as const;
