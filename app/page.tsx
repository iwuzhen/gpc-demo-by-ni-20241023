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

type TableDataType = {
  key: number;
  STS: string;
  GoogleDistance: string;
  TokenDistance: string;
};

export default function Home() {
  const [tableValue, setTableValue] = useState<TableDataType[]>([]);
  const [titleValue, setTitleValue] = useState("Mathematics");
  const [sizeValue, setSizeValue] = useState(50);

  const [loading, setLoading] = useState(true);

  const [options, setOptions] = useState<AutoCompleteProps['options']>([]);


  async function getDistance(title: string, size: number): Promise<TableDataType[]> {
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

        const result: any = []
        for (let i = 0; i < jsonData.data?.sts.length; i += 1) {
          result.push({
            key: i + 1,
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
    return []
  }

  const handleSearch = async (value: string) => {
    const result = await searchResult(value);
    console.log(result)
    setOptions(result ? result.map((item: string) => ({ value: item })) : []);
  };

  const onSelect = async (value: string) => {
    setTitleValue(value)
  };

  const onChange: InputNumberProps['onChange'] = (value: any) => {
    setSizeValue(value)
  };

  const updateTable = async () => {
    const result = await getDistance(titleValue, sizeValue);
    setTableValue(result)
  }
  useEffect(() => {
    updateTable()
  }, [sizeValue, titleValue])


  const columns = [
    {
      title: 'Index',
      dataIndex: 'key',
      key: 'key',
    },
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

  return (
    <>
      <Flex vertical className="p-10 ">
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
            <Input size="large" placeholder="Search Wikipedia" allowClear />
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
        <Table dataSource={tableValue} size="middle" loading={loading} columns={columns} className="mt-10" />;
      </Flex>
      <footer>
        <Flex justify="center" align="center" className="p-10">
          <a target="_blank" href="https://github.com/iwuzhen/gpc-demo-by-ni-20241023">Github</a>
        </Flex>
      </footer>
    </>
  );
}
