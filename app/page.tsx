"use client"

import { Flex, InputNumber, Table, Typography } from "antd";
import { useEffect, useState } from "react";


import { AutoComplete, Input } from 'antd';
import type { AutoCompleteProps, InputNumberProps } from 'antd';

async function searchResult(title: string) {
  try {
    const url = 'https://wiki.lmd.knogen.com:10443/api/wiki/getMHQueryTitle';
    const data = {
      title,
    };
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
    const response = await fetch(url, requestOptions)
    const jsonData = await response.json();
    if (jsonData?.msg === "success") {
      return jsonData.data
    }
    return []
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}


export default function Home() {
  const [tableValue, setTableValue] = useState([] as any);
  const [titleValue, setTitleValue] = useState("Mathematics");
  const [sizeValue, setSizeValue] = useState(10);

  const [loading, setLoading] = useState(true);

  const [options, setOptions] = useState<AutoCompleteProps['options']>([]);



  async function getDistance(title: string, size: number) {
    try {
      const url = 'https://wiki.lmd.knogen.com:10443/api/wiki/getWikiSomeXgd';
      const data = {
        title, size,
      };
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };
      setLoading(true)
      const response = await fetch(url, requestOptions)
      const jsonData = await response.json();
      if (jsonData?.msg === "success") {

        // key: '1',
        // STS: '胡彦斌',
        // GoogleDistance: 32,
        // TokenDistance: '西湖区湖底公园1号',
        const result: any = []
        for (const i in jsonData.data?.sts) {
          result.push({
            key: i,
            STS: jsonData.data?.sts[i],
            GoogleDistance: jsonData.data?.googledistance[i],
            TokenDistance: jsonData.data?.avg_googledistance[i],
          })
        }
        setLoading(false)
        return result
      }
      setLoading(false)
      return []
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const handleSearch = async (value: string) => {
    const result = await searchResult(value);
    console.log(result)
    setOptions(result ? result.map((item: string) => ({ value: item })) : []);
  };

  const updateTable = async () => {
    const result = await getDistance(titleValue, sizeValue);
    if (result)
      setTableValue(result as any)
  }
  const onSelect = async (value: string) => {
    console.log('onSelect', value);
    setTitleValue(value)
    updateTable()
  };

  const onChange: InputNumberProps['onChange'] = (value: any) => {
    setSizeValue(value)
    updateTable()
  };


  const columns = [
    {
      title: 'STS',
      dataIndex: 'STS',
      key: 'STS',
    },
    {
      title: 'Google distance',
      dataIndex: 'GoogleDistance',
      key: 'GoogleDistance',
    },
    {
      title: 'Token distance',
      dataIndex: 'TokenDistance',
      key: 'TokenDistance',
    },
  ];

  useEffect(() => {
    updateTable()
  }, [])

  return (

    <Flex vertical className="p-10">
      <Typography.Title level={2}>文本相似度</Typography.Title>

      <Flex>
        <AutoComplete
          popupMatchSelectWidth={252}
          defaultValue={titleValue}
          style={{ width: 300 }}
          options={options}
          onSelect={onSelect}
          onSearch={handleSearch}
          size="large"
        >
          <Input.Search size="large" placeholder="Search Wikipedia" enterButton />
        </AutoComplete>
        <div className="w-10"></div>
        <InputNumber
          min={10}
          max={100}
          size="middle"
          prefix="size:"
          defaultValue={sizeValue}
          onChange={onChange} changeOnWheel />
      </Flex>
      <Table dataSource={tableValue} loading={loading} columns={columns} className="mt-10" />;
    </Flex>
  );
}
