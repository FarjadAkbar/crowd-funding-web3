import React, { useContext, createContext, ReactNode } from 'react';
import {
  useAddress,
  useContract,
  useMetamask,
  useContractWrite,
} from '@thirdweb-dev/react';
import { Contract, ethers } from 'ethers';
import { EditionMetadataWithOwnerOutputSchema } from '@thirdweb-dev/sdk';

type Form = {
  title: string;
  description: string;
  target: string;
  deadline: string;
  image: string;
};

type Campaign = {
  owner: string;
  title: string;
  description: string;
  target: string;
  deadline: number;
  amountCollected: string;
  image: string;
  pId: number;
};


type Donation = {
  donator: string;
  donation: string;
}


type StateContextType = {
  address: string | undefined;
  contract: Contract | null;
  connect: () => void;
  createCampaign: (form: Form) => Promise<void>;
  getCampaigns: () => Promise<Campaign[]>;
  getUserCampaigns: () => Promise<Campaign[]>;
  donate: (pId: number, amount: string) => Promise<void>;
  getDonations: (pId: number) => Promise<Donation[]>;
};

const StateContext = createContext<StateContextType>({
  address: "",
  contract: null,
  connect: () => {},
  createCampaign: async () => {},
  getCampaigns: async () => [],
  getUserCampaigns: async () => [],
  donate: async () => {},
  getDonations: async () => [],
});

type StateContextProviderProps = {
  children: ReactNode;
};

export const StateContextProvider = ({
  children,
}: StateContextProviderProps) => {
  const { contract } = useContract(
    '0xf59A1f8251864e1c5a6bD64020e3569be27e6AA9'
  );
  const { mutateAsync: createCampaign } = useContractWrite(
    contract,
    'createCampaign'
  );

  const address = useAddress();
  const connect = useMetamask();

  const publishCampaign = async (form: Form) => {
    try {
      const data = await createCampaign([
        address as string, // owner
        form.title, // title
        form.description, // description
        form.target,
        new Date(form.deadline).getTime(), // deadline,
        form.image,
      ]);

      console.log('contract call success', data);
    } catch (error) {
      console.log('contract call failure', error);
    }
  };

  const getCampaigns = async () => {
    const campaigns = await contract?.call('getCampaigns');

    const parsedCampaings = campaigns?.map((campaign: any, i: number) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(
        campaign.amountCollected.toString()
      ),
      image: campaign.image,
      pId: i,
    }));

    return parsedCampaings ?? [];
  };

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaigns = allCampaigns.filter(
      (campaign) => campaign.owner === address
    );

    return filteredCampaigns;
  };

  const donate = async (pId: number, amount: string) => {
    const data = await contract?.call('donateToCampaign', pId, { value: ethers.utils.parseEther(amount) });
  
    return data;
  }
  

  const getDonations = async (pId: number): Promise<Donation[]> => {
    const donations = await contract?.call('getDonators', pId);
    const numberOfDonations = donations[0].length;
  
    const parsedDonations: Donation[] = [];
  
    for(let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString())
      })
    }
  
    return parsedDonations;
  }
  


  return (
    <StateContext.Provider
      value={{ 
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations
      }}
    >
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext);